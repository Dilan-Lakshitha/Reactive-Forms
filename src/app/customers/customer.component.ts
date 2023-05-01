import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';

import { Customer } from './customer';

//this fuction can use any component on other part of application
function ratingRange(min: number, max: number): ValidatorFn {
  return (c: AbstractControl): { [key: string]: boolean } | null=> {
    if (c.value !== null && (isNaN(c.value) || c.value < min || c.value > max)) {
      return { 'range': true };
    }
    return null;
  }
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customerForm!: FormGroup;
  customer = new Customer();

  constructor(private fb: FormBuilder) { }

  //Data inizializing using life cyle hock
  ngOnInit(): void {
    //creating a Form group method using Formbuilder instance,FoemControl associated with the Form group.
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.minLength(3)]],
      lastName: ['', [Validators.minLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: '',
      notification: 'email',
      rating:[null,ratingRange(1,5)],
      sendCatalog: true
    })

    //   this.customerForm=new FormGroup({
    //     firstName: new FormControl(),
    //     lastName: new FormControl(),
    //     email: new FormControl(),
    //     sendCatalog: new FormControl(true),
    //   });
  }
  // Data get form a component to html
  populateTestData(): void {
    this.customerForm.setValue({ 
      firstName: 'Jack',
      lastName: 'Harkness',
      email: 'jack@torchwood.com',
      sendCatalog: false
    });
  }

  // populateTestData():void{
  //   this.customerForm.patchValue({
  //     firstName:'Jack',
  //     lastName:'Harkness',
  //     email:'jack@torchwood.com',
  //     sendCatalog:false
  //   });
  // }
  //this is the method passing we click a button in UI
  save(): void {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  //validation rule that adjusts itself at runtime wen click a button 
  setNotifaction(notifiy: string): void {
    const phoneControl = this.customerForm.get('phone');
    if (notifiy == 'text') {
      phoneControl?.setValidators(Validators.required);
    } else {
      phoneControl?.clearValidators();
    }
    phoneControl?.updateValueAndValidity();
  }
}
