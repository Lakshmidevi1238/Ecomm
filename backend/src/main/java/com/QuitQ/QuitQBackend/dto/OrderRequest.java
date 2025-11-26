package com.QuitQ.QuitQBackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class OrderRequest {

    public static class Shipping {
        @NotBlank public String name;
        @NotBlank public String line1;
        public String line2;
        @NotBlank public String city;
        public String state;
        @NotBlank public String postalCode;
        @NotBlank public String country;
        @NotBlank public String phone;

        public Shipping() {}
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getLine1() { return line1; }
        public void setLine1(String line1) { this.line1 = line1; }
        public String getLine2() { return line2; }
        public void setLine2(String line2) { this.line2 = line2; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }

    @NotNull
    private Shipping shipping;

    @NotBlank
    private String paymentMethod; 

    private String notes;

    public OrderRequest() {}

    public Shipping getShipping() { return shipping; }
    public void setShipping(Shipping shipping) { this.shipping = shipping; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
