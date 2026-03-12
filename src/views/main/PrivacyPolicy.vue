<script setup lang="ts">
import { ChevronLeft, ShieldCheck, Lock, Eye, FileText, Scale } from 'lucide-vue-next'

const emit = defineEmits(['back'])

const sections = [
  {
    icon: ShieldCheck,
    title: '1. Introduction',
    content: 'TruckMitr.com ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, disclose, and safeguard your personal data in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act). By accessing or using our services, you consent to the collection and processing of your personal data as described in this policy.'
  },
  {
    icon: Eye,
    title: '2. Extent and Application',
    content: 'This policy applies to the personal data of users located in India as well as users accessing our services from outside India in relation to goods and services provided within the country.'
  },
  {
    icon: FileText,
    title: '3. Data We Use',
    list: [
      'Identification Data: Aadhaar number, PAN number, GST number, Voter ID, or other government-issued IDs.',
      'Contact Data: Name, phone number, email address, and physical address.',
      'Financial Data: Bank account details, UPI ID, and payment information.',
      'Transactional Data: Data relating to services availed through our platform.',
      'Technical Data: IP address, device details, and location data.',
      'Business Data: Company name, registration number, and related information.'
    ]
  },
  {
    icon: Scale,
    title: '4. Purposes of Collection of Data',
    list: [
      'User identification and regulatory compliance.',
      'Facilitation of services including truck booking, freight management, and logistics support.',
      'Payment processing and billing.',
      'Customer service and complaint redressal.',
      'Anti-fraud and platform security measures.',
      'Notifications, updates, and service-related communication.',
      'Legal and statutory compliance.'
    ]
  },
  {
    icon: Lock,
    title: '5. Consent and Revocation',
    content: 'Consent: By registering or using our services, you provide consent for the collection and processing of your personal data. \n\nWithdrawal of Consent: You may withdraw consent at any time by contacting us at contact@truckmitr.com. However, withdrawal may affect your access to our services.'
  },
  {
    icon: ShieldCheck,
    title: '6. Data Sharing and Disclosure',
    content: 'We do not rent or sell personal data. Data may be shared with:',
    list: [
      'Authorised Third Parties: Such as payment processors, logistics partners, and ID verification services.',
      'Government Authorities: As required by law, regulation, or legal process.',
      'Service Providers: Bound by strict confidentiality agreements, for outsourcing specific services.'
    ]
  },
  {
    icon: FileText,
    title: '7. Data Storage',
    content: 'Data is retained only as long as necessary for the defined purpose or as required by law. After this period, data is anonymized or deleted securely.'
  },
  {
    icon: Scale,
    title: '8. Rights of the Data Principal',
    list: [
      'Right to Access: Request a copy of your personal data.',
      'Right to Rectification and Erasure: Request correction or deletion of inaccurate or unnecessary data.',
      'Right to Data Portability: Receive your data in a machine-readable format.',
      'Right to Remedial Redress: File complaints if your data is misused.'
    ]
  },
  {
    icon: ShieldCheck,
    title: '9. Data Protection',
    content: 'We implement appropriate technical and organizational measures to secure personal data from unauthorized access, alteration, or disclosure. This includes encryption, secure servers, and controlled access systems.'
  },
  {
    icon: Lock,
    title: '10. International Data Transfer',
    content: 'Personal data may be transferred across Indian borders to jurisdictions approved under applicable laws, ensuring data security and legal compliance.'
  },
  {
    icon: FileText,
    title: '11. Contact Information',
    content: 'Name: Mr. Deepak Arora \nEmail: contact@truckmitr.com \nPhone: +91 9254972811 \nAddress: Rohtak Rd, Surya Nagar, Bahadurgarh, Sankhol, Haryana 124507'
  },
  {
    icon: Scale,
    title: '12. Changes to Our Privacy Policy',
    content: 'We may update this policy periodically to reflect changes in legal or operational practices. Significant updates will be communicated through our website or other appropriate means. \n\nBy continuing to use our services, you acknowledge and accept the terms of this Privacy Policy.'
  }
]
</script>

<template>
  <div class="privacy-master">
    <div class="privacy-container">
      <!-- Header -->
      <header class="privacy-header">
        <button class="back-link" @click="emit('back')">
          <ChevronLeft :size="20" />
          <span>Back to Profile</span>
        </button>
        <div class="header-main">
          <div class="privacy-badge">OFFICIAL DOCUMENT</div>
          <h1>Privacy Policy</h1>
          <p class="last-updated">Last Updated: March 2026 • Privacy Policy of TruckMitr.com</p>
        </div>
      </header>

      <!-- Content -->
      <main class="privacy-body">
        <div v-for="(section, idx) in sections" :key="idx" class="privacy-section">
          <div class="section-sidebar">
            <div class="section-icon">
              <component :is="section.icon" :size="20" />
            </div>
            <div class="section-line" v-if="idx !== sections.length - 1"></div>
          </div>
          <div class="section-content">
            <h2>{{ section.title }}</h2>
            <p v-if="section.content" class="text-content">{{ section.content }}</p>
            <ul v-if="section.list" class="list-content">
              <li v-for="(item, i) in section.list" :key="i">
                <div class="bullet"></div>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <!-- Sticky Footer -->
      <footer class="privacy-footer">
        <p>© 2026 TruckMitr Corporate Services Private Limited. All Rights Reserved.</p>
        <div class="footer-links">
          <span>Official DPDP Compliance</span>
          <div class="dot"></div>
          <span>Digital India</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;600;700&display=swap');

.privacy-master {
  background-color: #ffffff;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
  overflow-y: auto;
}

.privacy-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  padding: 60px 48px;
  display: flex;
  flex-direction: column;
}

/* Header */
.privacy-header {
  margin-bottom: 80px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 40px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 10px;
  margin-bottom: 40px;
  width: fit-content;
  transition: all 0.2s;
}

.back-link:hover {
  color: #0f172a;
  background: #f1f5f9;
  transform: translateX(-4px);
}

.privacy-badge {
  display: inline-block;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.header-main h1 {
  font-family: 'Outfit', sans-serif;
  font-size: 42px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
  letter-spacing: -1px;
}

.last-updated {
  font-size: 15px;
  color: #64748b;
  margin: 0;
}

/* Body Section */
.privacy-body {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 40px;
  flex: 1;
}

.privacy-section {
  display: flex;
  gap: 24px;
  background: #f8fafc;
  padding: 32px;
  border-radius: 24px;
  border: 1px solid #eef2f6;
  transition: all 0.3s ease;
}

.privacy-section:hover {
  background: #ffffff;
  border-color: #3b82f630;
  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05);
  transform: translateY(-4px);
}

.privacy-section.full-width {
  grid-column: 1 / -1;
}

.section-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 44px;
  flex-shrink: 0;
}

.section-icon {
  width: 44px;
  height: 44px;
  background: #ffffff;
  color: #3b82f6;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.03);
}

.section-content {
  flex: 1;
}

.section-content h2 {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 16px 0;
}

.text-content {
  font-size: 15px;
  line-height: 1.8;
  color: #475569;
  white-space: pre-line;
  margin: 0;
}

.list-content {
  list-style: none;
  padding: 0;
  margin: 16px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-content li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #475569;
  line-height: 1.6;
  font-size: 15px;
}

.bullet {
  width: 6px;
  height: 6px;
  background: #3b82f6;
  border-radius: 50%;
  margin-top: 8px;
  flex-shrink: 0;
}

/* Footer */
.privacy-footer {
  margin-top: 80px;
  padding: 40px;
  background: #1e3a8a;
  border-radius: 24px;
  text-align: center;
  color: #ffffff;
}

.privacy-footer p {
  font-size: 14px;
  opacity: 0.7;
  margin: 0 0 16px 0;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dot {
  width: 4px;
  height: 4px;
  background: #ffffff;
  border-radius: 50%;
}

@media (max-width: 768px) {
  .privacy-container {
    padding: 40px 24px;
  }
  .header-main h1 {
    font-size: 32px;
  }
  .privacy-section {
    gap: 16px;
  }
  .section-sidebar {
    display: none;
  }
}
</style>
