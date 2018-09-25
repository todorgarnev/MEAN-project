import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  public newPost = 'NO CONTENT';
  public enteredValue = '';

  constructor() { }

  ngOnInit() {
  }

  onAddPost() {
    this.newPost = this.enteredValue;
  }

}
