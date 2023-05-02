import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators,FormArray} from '@angular/forms'; 

import { debounceTime} from 'rxjs/operators';

import { Customer } from './customer';

function emailMatcher(c:AbstractControl):{[key:string]:boolean} | null{
  const emailControl=c.get('email');
  const confirmControl=c.get('confirmEmail');

  if(emailControl?.pristine||confirmControl?.pristine){
    return null;
  }

  if(emailControl?.value===confirmControl?.value){
    return null;
  }
  return {'match':true};
}


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
  emailMessage!: string; 
  

  get addresses():FormArray{
    return <FormArray>this.customerForm.get('addresses');
  }

  private validationMessages :any={
    required:'Please enter your email address.',
    email:'Pleade enter a valid email address.'
  };

  constructor(private fb: FormBuilder) { }

  //Data inizializing using life cyle hock
  ngOnInit(): void {
    //creating a Form group method using Formbuilder instance,FoemControl associated with the Form group.
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.minLength(3)]],
      lastName: ['', [Validators.minLength(50)]],
      //nested formBuilder group
      emailGroup: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', Validators.required],
      },{Validators: emailMatcher}),
      phone: '',
      notification: 'email',
      rating:[null,ratingRange(1,5)],
      sendCatalog: true,
      adaresses:this.fb.array([this.buildAddresss()])
    });
    //wather 
    // this is how to watch of cahnges 
    this.customerForm.get('notification')?.valueChanges.subscribe(
      value=>this.setNotifaction(value)
    );
    //watcher email control and delay time
    const emailControl=this.customerForm.get('emailGroup.email');
    emailControl?.valueChanges.pipe(
      debounceTime(1000)).subscribe(
      value=>this.setMessage(emailControl)
    );

    //   this.customerForm=new FormGroup({
    //     firstName: new FormControl(),
    //     lastName: new FormControl(),
    //     email: new FormControl(),
    //     sendCatalog: new FormControl(true),
    //   });
  }
  addAddress():void{
    this.addresses.push(this.buildAddresss());
  }

  buildAddresss():FormGroup{
    return this.fb.group({
      addressType:'home',
    street1:'',
    street2:'',
    city:'',
    state:'',
    zip:''
    })
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

  setMessage(c: AbstractControl): void {
    this.emailMessage = '';
    if ((c.touched || c.dirty) && c.errors) {
      this.emailMessage = Object.keys(c.errors).map(
        key => this.validationMessages[key]).join(' ');
    }
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

