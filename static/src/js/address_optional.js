/** @odoo-module **/

import { registry } from '@web/core/registry';
import { CustomerAddress } from '@portal/js/interactions/address';

/**
 * Override CustomerAddress interaction to make specific fields mandatory
 */
export class CustomerAddressOptional extends CustomerAddress {
    setup() {
        super.setup();
        // Set required fields: name, street, city, phone
        this.requiredFields = ['name', 'street', 'city', 'phone'];
        
        if (this.addressForm) {
            // Mark required fields: name, street, city, phone
            const requiredFields = ['name', 'street', 'city', 'phone'];
            requiredFields.forEach(fieldName => {
                const input = this.addressForm.querySelector(`[name="${fieldName}"]`);
                if (input) {
                    input.setAttribute('required', 'required');
                    input.required = true;
                }
                const label = this.addressForm.querySelector(`label[for="o_${fieldName}"]`);
                if (label) {
                    // Remove all existing asterisks (spans and text)
                    const existingAsterisks = label.querySelectorAll('.text-danger, span');
                    existingAsterisks.forEach(ast => {
                        if (ast.textContent.trim() === '*' || ast.classList.contains('text-danger')) {
                            ast.remove();
                        }
                    });
                    // Clean text content from asterisks
                    let labelText = label.textContent || label.innerText || '';
                    labelText = labelText.replace(/\s*\*\s*/g, ' ').trim();
                    if (labelText) {
                        label.textContent = labelText;
                    }
                    // Add required class - CSS will show asterisk via ::after
                    label.classList.add('o_website_form_label_required');
                    label.classList.remove('label-optional');
                }
            });
            
            // Make other fields optional (remove required markers)
            const optionalFields = ['email', 'zip', 'country_id'];
            optionalFields.forEach(fieldName => {
                const input = this.addressForm.querySelector(`[name="${fieldName}"]`);
                if (input) {
                    input.removeAttribute('required');
                    input.required = false;
                }
                const label = this.addressForm.querySelector(`label[for="o_${fieldName}"]`);
                if (label) {
                    // Remove required class
                    label.classList.remove('o_website_form_label_required');
                    label.classList.add('label-optional');
                    // Remove all asterisks (spans and text)
                    const existingAsterisks = label.querySelectorAll('.text-danger, span');
                    existingAsterisks.forEach(ast => {
                        if (ast.textContent.trim() === '*' || ast.classList.contains('text-danger')) {
                            ast.remove();
                        }
                    });
                    // Clean text content from asterisks
                    let labelText = label.textContent || label.innerText || '';
                    labelText = labelText.replace(/\s*\*\s*/g, ' ').trim();
                    if (labelText) {
                        label.textContent = labelText;
                    }
                }
            });
            
            // Set Pakistan as default country if no country is selected
            const countrySelect = this.addressForm.querySelector('#o_country_id');
            if (countrySelect && !countrySelect.value) {
                // Find Pakistan option (code PK)
                const options = countrySelect.querySelectorAll('option');
                for (let option of options) {
                    if (option.getAttribute('code') === 'PK') {
                        option.selected = true;
                        countrySelect.value = option.value;
                        // Trigger change event to load states if needed
                        countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
                        break;
                    }
                }
            }
            
            // Force hide State/Province field but keep element for JavaScript compatibility
            const stateDiv = this.addressForm.querySelector('#div_state');
            if (stateDiv) {
                stateDiv.style.display = 'none';
                stateDiv.style.visibility = 'hidden';
                stateDiv.style.height = '0';
                stateDiv.style.overflow = 'hidden';
            }
            // Also ensure the select element exists and is hidden
            const stateSelect = this.addressForm.querySelector('#o_state_id');
            if (stateSelect) {
                stateSelect.style.display = 'none';
                // Set a default empty value to prevent errors
                if (!stateSelect.value) {
                    stateSelect.value = '';
                }
            }
            
            // Override required_fields hidden input to only include our required fields
            const requiredFieldsInput = this.addressForm.querySelector('input[name="required_fields"]');
            if (requiredFieldsInput) {
                requiredFieldsInput.value = 'name,street,city,phone';
            }
            
            // Force email field to be optional (double-check)
            const emailInput = this.addressForm.querySelector('#o_email');
            if (emailInput) {
                emailInput.removeAttribute('required');
                emailInput.required = false;
            }
            const emailLabel = this.addressForm.querySelector('label[for="o_email"]');
            if (emailLabel) {
                emailLabel.classList.remove('o_website_form_label_required');
                emailLabel.classList.add('label-optional');
                // Remove any asterisks
                const asterisks = emailLabel.querySelectorAll('.text-danger, span');
                asterisks.forEach(ast => {
                    if (ast.textContent.trim() === '*' || ast.classList.contains('text-danger')) {
                        ast.remove();
                    }
                });
                // Clean text
                let labelText = emailLabel.textContent || emailLabel.innerText || '';
                labelText = labelText.replace(/\s*\*\s*/g, ' ').trim();
                if (labelText) {
                    emailLabel.textContent = labelText;
                }
            }
            
            // Add form validation on submit
            if (this.addressForm) {
                this.addressForm.addEventListener('submit', (e) => {
                    const requiredFields = ['name', 'street', 'city', 'phone'];
                    let hasErrors = false;
                    
                    requiredFields.forEach(fieldName => {
                        const input = this.addressForm.querySelector(`[name="${fieldName}"]`);
                        if (input && !input.value.trim()) {
                            hasErrors = true;
                            input.classList.add('is-invalid');
                            // Show error message
                            let errorDiv = input.parentElement.querySelector('.invalid-feedback');
                            if (!errorDiv) {
                                errorDiv = document.createElement('div');
                                errorDiv.className = 'invalid-feedback';
                                errorDiv.textContent = `This field is required`;
                                input.parentElement.appendChild(errorDiv);
                            }
                        } else if (input) {
                            input.classList.remove('is-invalid');
                            const errorDiv = input.parentElement.querySelector('.invalid-feedback');
                            if (errorDiv) {
                                errorDiv.remove();
                            }
                        }
                    });
                    
                    if (hasErrors) {
                        e.preventDefault();
                        e.stopPropagation();
                        // Show alert
                        const errorContainer = this.addressForm.querySelector('#errors') || document.querySelector('#errors');
                        if (errorContainer) {
                            errorContainer.innerHTML = '<div class="alert alert-danger" role="alert">Please fill in all required fields (marked with *)</div>';
                        }
                        // Scroll to first error
                        const firstError = this.addressForm.querySelector('.is-invalid');
                        if (firstError) {
                            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            firstError.focus();
                        }
                        return false;
                    }
                });
            }
        }
    }
    
    _markRequired(name, required) {
        // Only mark name, street, city, phone as required
        const requiredFields = ['name', 'street', 'city', 'phone'];
        if (this.addressForm) {
            const input = this.addressForm.querySelector(`[name="${name}"]`);
            const label = this._getInputLabel(name);
            
            if (requiredFields.includes(name)) {
                // Mark as required
                if (input) {
                    input.setAttribute('required', 'required');
                    input.required = true;
                }
                if (label) {
                    // Remove all existing asterisks first
                    const existingAsterisks = label.querySelectorAll('.text-danger, span');
                    existingAsterisks.forEach(ast => {
                        if (ast.textContent.trim() === '*' || ast.classList.contains('text-danger')) {
                            ast.remove();
                        }
                    });
                    // Clean text content
                    let labelText = label.textContent || label.innerText || '';
                    labelText = labelText.replace(/\s*\*\s*/g, ' ').trim();
                    if (labelText) {
                        label.textContent = labelText;
                    }
                    // Add required class - CSS will show asterisk
                    label.classList.add('o_website_form_label_required');
                    label.classList.remove('label-optional');
                }
            } else {
                // Mark as optional
                if (input) {
                    input.removeAttribute('required');
                    input.required = false;
                }
                if (label) {
                    // Remove all asterisks
                    const existingAsterisks = label.querySelectorAll('.text-danger, span');
                    existingAsterisks.forEach(ast => {
                        if (ast.textContent.trim() === '*' || ast.classList.contains('text-danger')) {
                            ast.remove();
                        }
                    });
                    // Clean text content
                    let labelText = label.textContent || label.innerText || '';
                    labelText = labelText.replace(/\s*\*\s*/g, ' ').trim();
                    if (labelText) {
                        label.textContent = labelText;
                    }
                    // Remove required class
                    label.classList.remove('o_website_form_label_required');
                    label.classList.add('label-optional');
                }
            }
        }
    }
}

// Replace the original CustomerAddress interaction
registry.category('public_interactions').remove('portal.customer_address');
registry.category('public_interactions').add('portal.customer_address', CustomerAddressOptional);

