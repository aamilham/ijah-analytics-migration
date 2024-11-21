import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http'; // Import HttpClientModule dan HttpClient

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule], // Tambahkan HttpClientModule
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  contactForm: FormGroup;
  submissionSuccess: boolean = false;
  submissionError: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    // Inject HttpClient
    this.contactForm = this.fb.group({
      subject: ['', Validators.required],
      name: ['', Validators.required],
      affiliation: [''],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      console.log('Form Submitted!', this.contactForm.value);
      // Gunakan endpoint JsonPlaceholder untuk pengujian
      this.http
        .post(
          'https://jsonplaceholder.typicode.com/posts',
          this.contactForm.value
        )
        .subscribe({
          next: (response) => {
            console.log('Form Submitted Successfully!', response);
            this.submissionSuccess = true;
            this.submissionError = false;
            this.contactForm.reset();
          },
          error: (error) => {
            console.error('Error submitting form', error);
            this.submissionSuccess = false;
            this.submissionError = true;
          },
        });
    } else {
      this.contactForm.markAllAsTouched(); // Tandai semua kontrol sebagai tersentuh untuk memicu validasi
    }
  }
}
