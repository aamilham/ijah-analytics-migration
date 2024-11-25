import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  contactForm: FormGroup;
  submissionSuccess: boolean = false;
  submissionError: boolean = false;
  errorMessage: string = '';
  isSubmitting: boolean = false;
  private apiUrl = 'http://localhost:8000/contact.php';  // Updated API URL

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.contactForm = this.fb.group({
      subject: ['', Validators.required],
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern('^[a-zA-Z0-9 ]*$')
      ]],
      affiliation: ['', [
        Validators.maxLength(200),
        Validators.pattern('^[a-zA-Z0-9 .-]*$')
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]],
      message: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
    });
  }

  // Getter methods for form validation
  get nameErrors() {
    const control = this.contactForm.get('name');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Name is required';
      if (control.errors['minlength']) return 'Name must be at least 2 characters';
      if (control.errors['maxlength']) return 'Name cannot exceed 100 characters';
      if (control.errors['pattern']) return 'Name can only contain letters, numbers and spaces';
    }
    return '';
  }

  get emailErrors() {
    const control = this.contactForm.get('email');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Email is required';
      if (control.errors['email'] || control.errors['pattern']) return 'Please enter a valid email address';
    }
    return '';
  }

  get messageErrors() {
    const control = this.contactForm.get('message');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Message is required';
      if (control.errors['minlength']) return 'Message must be at least 10 characters';
      if (control.errors['maxlength']) return 'Message cannot exceed 500 characters';
    }
    return '';
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submissionError = false;
      this.submissionSuccess = false;

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });

      this.http
        .post(this.apiUrl, this.contactForm.value, { headers })
        .subscribe({
          next: (response: any) => {
            console.log('Server response:', response);
            if (response.ack === 'OK') {
              console.log('Message sent successfully!');
              this.submissionSuccess = true;
              this.submissionError = false;
              this.contactForm.reset();
              // Reset radio buttons to default value
              this.contactForm.patchValue({
                subject: ''
              });
              // Hide success message after 5 seconds
              setTimeout(() => {
                this.submissionSuccess = false;
              }, 5000);
            } else {
              console.error('Server returned error:', response);
              this.submissionError = true;
              this.submissionSuccess = false;
              this.errorMessage = response.message || 'An error occurred while sending your message.';
            }
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error sending message:', error);
            this.submissionSuccess = false;
            this.submissionError = true;
            this.errorMessage = 'An error occurred while sending your message. Please try again later.';
            this.isSubmitting = false;
          },
        });
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
}
