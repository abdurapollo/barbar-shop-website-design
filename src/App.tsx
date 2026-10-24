/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { GallerySection } from './components/GallerySection';
import { TeamSection } from './components/TeamSection';
import { AboutSection } from './components/AboutSection';
import { FindUsSection } from './components/FindUsSection';
import { ReviewsSection } from './components/ReviewsSection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { ManageBookingModal } from './components/ManageBookingModal';
import { PolicyModals, PolicyType } from './components/PolicyModals';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { db } from './lib/db';
import { Service, Staff, BusinessDayHours, GalleryItem, Testimonial, BookingSettings } from './types';

export default function App() {
  // App state
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessDayHours[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [bookingSettings, setBookingSettings] = useState<BookingSettings>(db.getBookingSettings());

  // Modal states
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | null>(null);
  const [isManageBookingOpen, setIsManageBookingOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);

  // Sync state with database
  const loadDatabaseData = () => {
    setServices(db.getServices());
    setStaffList(db.getStaff());
    setBusinessHours(db.getBusinessHours());
    setGallery(db.getGallery());
    setReviews(db.getReviews());
    setBookingSettings(db.getBookingSettings());
  };

  useEffect(() => {
    loadDatabaseData();

    // Auto-sync with Supabase backend on startup
    db.syncWithSupabase().then(() => {
      loadDatabaseData();
    }).catch(err => {
      console.warn('Initial Supabase sync notice:', err);
    });

    // Keyboard shortcut for quick admin access: Ctrl+Shift+A or Cmd+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenBooking = (serviceId?: string) => {
    if (serviceId) {
      setPreselectedServiceId(serviceId);
    } else {
      setPreselectedServiceId(null);
    }
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#E8E5DE] flex flex-col font-sans">
      
      {/* Top Bar Header */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenManageBooking={() => setIsManageBookingOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onOpenBooking={() => handleOpenBooking()}
          unconfirmedNoticeActive={bookingSettings.unconfirmed_pricing_notice_active}
        />

        {/* Services & Pricing Section */}
        <ServicesSection
          services={services}
          onSelectServiceToBook={srvId => handleOpenBooking(srvId)}
        />

        {/* Style Gallery & Portfolio Section */}
        <GallerySection
          galleryItems={gallery}
          onOpenBooking={() => handleOpenBooking()}
        />

        {/* Master Barber Team Section */}
        <TeamSection
          staffList={staffList}
          onBookWithStaff={() => handleOpenBooking()}
        />

        {/* About Heritage & Craft Section */}
        <AboutSection />

        {/* Opening Hours, Bradford Location & Map Section */}
        <FindUsSection
          businessHours={businessHours}
        />

        {/* Authentic Google Maps Reviews Section */}
        <ReviewsSection reviews={reviews} />

        {/* Frequently Asked Questions */}
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenBooking={() => handleOpenBooking()}
        onOpenManageBooking={() => setIsManageBookingOpen(true)}
        onOpenPolicy={type => setActivePolicy(type)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Modals & Portals */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setPreselectedServiceId(null);
        }}
        preselectedServiceId={preselectedServiceId}
        onBookingCreated={() => loadDatabaseData()}
      />

      <ManageBookingModal
        isOpen={isManageBookingOpen}
        onClose={() => setIsManageBookingOpen(false)}
        onAppointmentUpdated={() => loadDatabaseData()}
      />

      <PolicyModals
        policy={activePolicy}
        onClose={() => setActivePolicy(null)}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onDataChanged={() => loadDatabaseData()}
      />

    </div>
  );
}
