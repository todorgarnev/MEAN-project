import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  public isLoading: boolean = false;

  public onSignup(form: NgForm) {
    console.log(form.value);
  }

}
