import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { AuthData } from './auth-data.model';

const BACKEND_URL = environment.apiUrl + '/user/';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: NodeJS.Timer;
  private userId: string;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient,
    private router: Router) { }

  public getToken() {
    return this.token;
  }

  public getIsAuth() {
    return this.isAuthenticated;
  }

  public getUserId() {
    return this.userId;
  }

  public getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  public createUser(email: string, password: string) {
    const authData: AuthData = {
      email: email,
      password: password
    };

    return this.http.post(BACKEND_URL + '/signup', authData)
      .subscribe(() => {
        this.router.navigate(['/login']);
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  public login(email: string, password: string) {
    const authData: AuthData = {
      email: email,
      password: password
    };

    this.http.post<{ token: string, expiresIn: number, userId: string }>(BACKEND_URL + '/login', authData)
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        if (token) {
          const expiresInDuration = response.expiresIn;
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);

          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.userId = response.userId;
          this.authStatusListener.next(true);
          this.saveAuthData(token, expirationDate, this.userId);
          this.router.navigate(['/']);
        }
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  public autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  public logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('expirauserIdtion');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if (!token || !expirationDate) {
      return;
    } else {
      return {
        token: token,
        expirationDate: new Date(expirationDate),
        userId: userId
      };
    }
  }
}
