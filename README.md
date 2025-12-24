# Fix Zone – Smart Vehicle Service Management Platform

## 1. Project Overview
Fix Zone is a multi-tenant web application designed to digitalize and streamline operations of vehicle service centers, connecting multiple roles including Super Admins, Company Owners, Service Center Managers, and Customers.

The platform ensures data isolation per tenant, allowing each company or service center to access only its own data, while Super Admin manages the entire system.

## 2. Objectives
- **Digitalization**: Replace manual logs with an online system.
- **Multi-Tenant Architecture**: Single platform, isolated data for multiple companies.
- **Role-Based Experience**: Tailored dashboards for Super Admin, Owner, Manager, and Customer.
- **Enhanced UX**: Modern, responsive UI with fixed sidebar/navbar.

## 3. Core Roles
- **👑 Super Admin**: Platform oversight (Tenants, Users, Global Data).
- **🏢 Company Owner**: Manage specific company, service centers, and business analytics.
- **🛠️ Service Center Manager**: Daily operations (Jobs, Vehicles, Customers) of a branch.
- **🚗 Customer**: Booking services, viewing history, and tracking availability.

## 4. Key Features
### Guest & Authentication
- Modern Landing Page.
- Login/Signup with role selection.
- Tenant context identification.

### Dashboards
- **Fixed Sidebar & Navbar layout**.
- **Super Admin**: User/Tenant management, Global System Settings.
- **Company Owner**: Branch management, Financial Analytics.
- **Service Manager**: Active job tracking, Customer database.
- **Customer**: Service history, Online booking.

## 5. Technology Stack (Frontend)
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Icons**: React Icons
- **Charts**: Recharts
- **State/Logic**: React Hooks

## 6. Architecture Highlights
- **Multi-Tenancy**: Data isolation at the view level (mocked in frontend via role-based routing).
- **Responsive Design**: Mobile-first approach with collapsible menus (future) and adaptive grids.
