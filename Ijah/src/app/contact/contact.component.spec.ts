import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  subjects: string[] = ['Question', 'Error/Bugs', 'Wishlist'];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Inisialisasi FormGroup menggunakan FormBuilder
    this.contactForm = this.fb.group({
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.maxLength(500)]],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      affiliation: [''],
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      console.log('Form is valid, showing confirmation modal...');
      let confirmationModal = new (window as any).bootstrap.Modal(
        document.getElementById('confirmationModal') as HTMLElement
      );
      confirmationModal.show();
    } else {
      console.log('Form is not valid, showing validation errors...');
      this.contactForm.markAllAsTouched(); // Menandai semua field sebagai touched
    }
  }

  confirmSubmit(): void {
    // Dapatkan data input form dalam format JSON
    const formData = this.contactForm.value;
    console.log('Form Data (JSON):', JSON.stringify(formData, null, 2));

    // Tampilkan pesan berhasil
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
      successMessage.classList.remove('d-none');
    }

    // Reset form setelah submit
    this.contactForm.reset();
  }
}
