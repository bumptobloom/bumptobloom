export interface LegalSection {
  id: string;
  number: number;
  title: string;
  content?: string;
  paragraphs?: string[];
  subsections?: {
    title?: string;
    description?: string;
    items?: string[];
  }[];
  listItems?: string[];
  callout?: string;
}

export interface LegalDocument {
  id: string;
  title: string;
  partTitle?: string;
  effectiveDate: string;
  lastUpdated: string;
  preamble: string[];
  sections: LegalSection[];
  contactEmail: string;
  contactWebsite: string;
}

export const TERMS_OF_USE: LegalDocument = {
  id: 'terms-of-use',
  title: 'Terms of Use',
  partTitle: 'Part I — BumpToBloom Terms of Use',
  effectiveDate: 'October 20, 2026',
  lastUpdated: 'October 20, 2026',
  preamble: [
    'Welcome to BumpToBloom! These Terms of Use ("Terms") govern access to and use of BumpToBloom\'s website, app, and related features (collectively, the "Service"). By creating an account or using the Service, you agree to these Terms. If you do not agree, do not use the Service.',
  ],
  contactEmail: 'team.bumptobloom@gmail.com',
  contactWebsite: 'bumptobloom.app',
  sections: [
    {
      id: 'about-the-service',
      number: 1,
      title: 'About the Service',
      content:
        'BumpToBloom is for adult parents and caregivers. It may provide age-appropriate parenting education, developmental milestone tracking, temperature logging, AI-assisted informational responses, personalized content, and product or resource links.',
    },
    {
      id: 'eligibility',
      number: 2,
      title: 'Eligibility',
      content:
        'You must be at least 18 years old, or the age of legal majority where you live, to create an account. The Service is not intended for children to create accounts or independently provide information.',
    },
    {
      id: 'educational-information-only',
      number: 3,
      title: 'Educational Information Only',
      content:
        'BumpToBloom provides parenting and health-related information for educational purposes only. The Service does not provide medical advice, diagnosis, treatment, clinical decision support, or medical triage. Contact a qualified healthcare professional about medical concerns.',
    },
    {
      id: 'emergencies',
      number: 4,
      title: 'Emergencies',
      content:
        'BumpToBloom is not designed to identify or respond to every emergency or crisis. Do not use the Service instead of contacting emergency services. If you believe you, your child, or another person may be in immediate danger, call 911 in the United States or the appropriate emergency number where you are.',
    },
    {
      id: 'ai-generated-information',
      number: 5,
      title: 'AI-Generated Information',
      content:
        'AI systems can make mistakes. An AI response may be incomplete, inaccurate, misleading, or inappropriate for your circumstances. Do not rely solely on AI-generated information for a medical, safety, or emergency decision. You are responsible for evaluating whether and how to use information produced by the Service.',
    },
    {
      id: 'temperature-log',
      number: 6,
      title: 'Temperature Log',
      content:
        'The temperature log is not a medical monitoring service. A threshold, label, icon, color, informational message, or other visual treatment does not determine whether a child has a condition, whether the condition is serious, whether treatment or emergency care is required, or whether it is safe to delay professional care.',
    },
    {
      id: 'developmental-milestones',
      number: 7,
      title: 'Developmental Milestones and Learn Content',
      content:
        'Children develop at different rates. A milestone checklist is not a diagnosis or professional developmental screening. Learn content and summaries are educational and may refer or link to third-party sources. Those sources do not sponsor or endorse BumpToBloom unless expressly stated.',
    },
    {
      id: 'caregiver-wellbeing',
      number: 8,
      title: 'Caregiver Wellbeing',
      content:
        'BumpToBloom may provide general information about stress, exhaustion, or emotional wellbeing. It is not mental-health treatment or a crisis service. Any automated safety message may fail to recognize a crisis. If immediate danger is possible, contact emergency services. In the United States, you may also call or text 988 for the Suicide & Crisis Lifeline.',
    },
    {
      id: 'your-account',
      number: 9,
      title: 'Your Account',
      content:
        'You must provide accurate information, protect your credentials, prevent unauthorized access, and notify us promptly if you believe your account has been compromised. You are responsible for activity through your account except where law provides otherwise.',
    },
    {
      id: 'acceptable-use',
      number: 10,
      title: 'Acceptable Use',
      content: 'You may not:',
      listItems: [
        'Use the Service unlawfully or to harm, threaten, exploit, or endanger another person.',
        'Access another account or submit information you are not authorized to provide.',
        'Circumvent security, probe for vulnerabilities without authorization, or interfere with Service operation.',
        'Upload malicious code or misuse automated tools to scrape or excessively access the Service.',
        'Misrepresent your identity or affiliation.',
        'Copy, reverse engineer, modify, or distribute the Service except as allowed by law or written permission.',
      ],
    },
    {
      id: 'user-provided-information',
      number: 11,
      title: 'User-Provided Information',
      paragraphs: [
        'You retain ownership of information you submit. You grant BumpToBloom a limited license to host, use, process, reproduce, and display that information only as reasonably necessary to operate, maintain, secure, test, and improve the Service as described in our Privacy Policy.',
        'This license ends when the information is deleted, subject to reasonable backup, security, and legal retention. These Terms do not transfer ownership of your personal or health-related information to BumpToBloom.',
      ],
    },
    {
      id: 'product-recommendations',
      number: 12,
      title: 'Product Recommendations and External Links',
      paragraphs: [
        'A product or resource link does not mean the item is medically necessary, safe for every child, or appropriate for a particular situation. Evaluate products independently, follow manufacturer instructions, and seek professional guidance when appropriate.',
        'Third-party products, services, content, terms, and privacy practices are controlled by their providers. BumpToBloom is not responsible for them. BumpToBloom does not receive affiliate commissions or compensation from third-party purchases.',
      ],
    },
    {
      id: 'intellectual-property',
      number: 13,
      title: 'Intellectual Property and Third-Party Content',
      paragraphs: [
        'Except for user-provided information and third-party material, the Service, software, design, branding, interface, and original content are owned by or licensed to BumpToBloom and protected by intellectual-property law. These Terms grant you a limited, personal, non-exclusive, non-transferable, revocable right to use the Service for its intended purpose.',
        'Ownership of third-party material remains with its owner. References to the CDC, WHO, American Academy of Pediatrics, HealthyChildren.org, hospitals, healthcare systems, retailers, or other organizations do not imply endorsement or affiliation unless expressly stated.',
      ],
    },
    {
      id: 'disclaimers',
      number: 14,
      title: 'Disclaimers',
      callout:
        'TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” BUMPTOBLOOM DISCLAIMS ALL EXPRESS AND IMPLIED WARRANTIES, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, SECURITY, AND AVAILABILITY. WE DO NOT GUARANTEE THAT THE SERVICE OR ANY AI-GENERATED, EDUCATIONAL, OR PRODUCT INFORMATION WILL BE ACCURATE, COMPLETE, CURRENT, OR APPROPRIATE FOR A PARTICULAR PERSON.',
      content: 'Nothing in this section limits a right that cannot legally be waived.',
    },
    {
      id: 'limitation-of-liability',
      number: 15,
      title: 'Limitation of Liability',
      callout:
        'TO THE MAXIMUM EXTENT PERMITTED BY LAW, BUMPTOBLOOM AND ITS OWNERS, TEAM MEMBERS, DEVELOPERS, CONTRACTORS, AND SERVICE PROVIDERS WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES ARISING FROM OR RELATED TO THE SERVICE.\n\nTO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID BUMPTOBLOOM FOR THE SERVICE DURING THE 12 MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM OR (B) US $100.',
      content: 'Nothing in these Terms excludes or limits liability that cannot legally be excluded or limited.',
    },
    {
      id: 'suspension-and-termination',
      number: 16,
      title: 'Suspension and Termination',
      content:
        'You may stop using the Service and request to delete your account at any time. We may suspend or terminate access when reasonably necessary to address security concerns, misuse, and violation of these Terms.',
    },
    {
      id: 'changes-to-terms',
      number: 17,
      title: 'Changes to the Service or Terms',
      content:
        'We may change the Service or these Terms as BumpToBloom evolves. We will post revised Terms with a new “Last Updated” date and provide additional notice when required by law. Continued use after revised Terms take effect constitutes acceptance where permitted by law.',
    },
    {
      id: 'contact',
      number: 18,
      title: 'Contact',
      content: 'Questions about these Terms? Contact BumpToBloom at:',
    },
  ],
};

export const PRIVACY_POLICY: LegalDocument = {
  id: 'privacy-policy',
  title: 'Privacy Policy',
  effectiveDate: 'October 20, 2026',
  lastUpdated: 'October 20, 2026',
  preamble: [
    'BumpToBloom ("BumpToBloom," "we," "us," or "our") respects your privacy. This Privacy Policy explains what information we collect, how we use and disclose it, how long we keep it, and the choices available to you. By using our website or app (the "Service"), you agree to the terms of this Privacy Policy.',
  ],
  contactEmail: 'team.bumptobloom@gmail.com',
  contactWebsite: 'bumptobloom.app',
  sections: [
    {
      id: 'information-we-collect',
      number: 1,
      title: 'Information We Collect',
      subsections: [
        {
          title: 'Information you provide',
          items: [
            'Account information, such as your name, email address, login credentials, and preferences.',
            'Parent or caregiver information, including parenting interests, questions, preferences, and any information you choose to provide.',
            "Child profile information entered by an adult, such as a child's first name or nickname, image, date of birth or age, and age in months.",
            'Milestone, feeding, sleeping, diaper, digestion, crying, soothing, and related parenting information.',
            'Temperature readings, measurement method, date, time, and notes associated with a reading.',
            'Messages and other content submitted through the Ask feature.',
            'Communications you send to us, including support requests and beta feedback.',
          ],
          description:
            'Ask messages and notes may reveal physical health, mental or emotional wellbeing, or other sensitive information. Provide only the information needed for the feature you are using.',
        },
        {
          title: 'Information collected automatically',
          items: [
            'Device type, operating system, browser type, IP address, and general location derived from an IP address.',
            'Login, session, feature-use, date-and-time, diagnostic, crash, and security information.',
            'Cookies, local storage, and similar technologies as described in Section 7.',
          ],
        },
        {
          title: 'Information we derive',
          description:
            "We may calculate a child's age in months, organize a temperature history, or select age-appropriate content from information you provide.",
        },
      ],
    },
    {
      id: 'how-we-use-information',
      number: 2,
      title: 'How We Use Information',
      listItems: [
        'Create, authenticate, and maintain accounts.',
        'Associate information with the correct adult user and child profile.',
        'Provide age-appropriate educational content, milestone tracking, temperature logging, Ask responses, and requested personalization.',
        'Operate, secure, troubleshoot, evaluate, and improve the beta Service.',
        'Allow authorized team members to review limited Ask conversations and beta feedback for safety, quality, and product testing.',
        'Respond to questions and provide support.',
        'Prevent fraud, misuse, security incidents, and violations of our Terms of Use.',
        'Comply with law and protect the rights, safety, and property of BumpToBloom, our users, and others.',
      ],
      content: 'We do not sell your personal information to any third parties.',
    },
    {
      id: 'ai-and-ask-conversations',
      number: 3,
      title: 'AI and Ask Conversations',
      paragraphs: [
        'When you use Ask, we process your message and the information needed to generate a response. Our systems and contracted AI, hosting, database, and security providers may process this information for us.',
        'AI-generated responses may be inaccurate, incomplete, outdated, or inappropriate for your circumstances. They are educational only. They are not medical advice, diagnosis, treatment, clinical decision support, or a substitute for a qualified healthcare professional.',
      ],
    },
    {
      id: 'temperature-log-privacy',
      number: 4,
      title: 'Temperature Log and Other Health-Related Information',
      content:
        'The temperature log is a record-keeping and educational feature. It is not a diagnosis, risk score, medical triage decision, or recommendation to seek or delay care.',
    },
    {
      id: 'how-we-disclose-information',
      number: 5,
      title: 'How We Disclose Information',
      content: 'We may disclose information in the following limited circumstances:',
      listItems: [
        'Service providers. Vendors that provide hosting, databases, authentication, artificial intelligence, security, error monitoring, analytics, development infrastructure, or customer support may process information only to perform services for us and subject to applicable contractual and legal limits.',
        'Legal and safety reasons. We may disclose information when reasonably necessary to comply with law or legal process, investigate misuse or a security incident, or protect rights, property, or safety.',
      ],
    },
    {
      id: 'product-recommendations-privacy',
      number: 6,
      title: 'Product Recommendations and Third-Party Links',
      content:
        'The Service may link to retailers, educational resources, healthcare organizations, or other third parties. A third party may collect information under its own privacy policy when you visit its site. We do not control and are not responsible for third-party privacy or security practices. BumpToBloom does not have affiliate relationships and does not receive commissions or other compensation from purchases made through third-party links.',
    },
    {
      id: 'cookies-and-tracking',
      number: 7,
      title: 'Cookies and Tracking',
      content:
        'BumpToBloom may use cookies, local storage, or similar technologies that are necessary to keep you signed in, remember settings, protect the Service, and maintain basic functionality.',
    },
    {
      id: 'data-retention-and-deletion',
      number: 8,
      title: 'Data Retention and Deletion',
      paragraphs: [
        'We keep personal information only as long as reasonably necessary to operate and test the Service, fulfill the purposes described in this Policy, protect security, comply with applicable law, resolve disputes, and enforce agreements.',
        'You may request deletion of your account and associated personal data at any time by contacting us at team.bumptobloom@gmail.com. Upon receiving and verifying your request, we delete your personal information from our active systems without undue delay, subject to standard backup overwrites, security procedures, and legal retention obligations.',
        'We may retain limited information only where a legal obligation requires it, or in de-identified form that can no longer reasonably be linked to you or your child.',
      ],
    },
    {
      id: 'data-security',
      number: 9,
      title: 'Data Security',
      content:
        'We use reasonable administrative, technical, and organizational safeguards designed to protect information from unauthorized access, use, alteration, loss, or disclosure. However, no internet-connected system is completely secure, and we cannot guarantee absolute security.',
    },
    {
      id: 'privacy-choices-and-rights',
      number: 10,
      title: 'Your Privacy Choices and Rights',
      content: 'Depending on where you live and the law that applies, you may have the right to ask us to:',
      listItems: [
        'Confirm whether we process your personal information.',
        'Provide access to or a portable copy of certain information.',
        'Correct inaccurate information.',
        'Delete personal information.',
        'Withdraw consent when processing depends on consent.',
        'Restrict or object to certain processing.',
        'Appeal a decision on a privacy request, where applicable.',
      ],
      paragraphs: [
        'Submit a request to team.bumptobloom@gmail.com. We may verify your identity before acting on a request.',
      ],
    },
    {
      id: 'childrens-privacy',
      number: 11,
      title: "Children's Privacy",
      content:
        'BumpToBloom is not intended for children, and we do not knowingly collect personal information directly from children under 13. If we learn that a child under 13 has provided personal information to us, we will delete it promptly.',
    },
    {
      id: 'hipaa',
      number: 12,
      title: 'HIPAA',
      content:
        'BumpToBloom is a consumer parenting application. It is not a healthcare provider, health plan, healthcare clearinghouse, or a service acting for one of those entities. Information submitted directly to BumpToBloom therefore is not protected health information under HIPAA. Other federal and state privacy and consumer-protection laws may still apply.',
    },
    {
      id: 'international-users',
      number: 13,
      title: 'International Users',
      content:
        'If you use the Service outside the United States, your information may be transferred to, stored in, and processed in the United States or another country whose laws differ from those where you live.',
    },
    {
      id: 'changes-to-policy',
      number: 14,
      title: 'Changes to This Policy',
      content:
        'We may update this Policy as the Service changes. We will post the revised version with a new “Last Updated” date and provide additional notice or obtain consent when required by law.',
    },
    {
      id: 'contact-us',
      number: 15,
      title: 'Contact Us',
      content: 'Questions and privacy requests may be sent to:',
    },
  ],
};

export const CONSUMER_HEALTH_DATA_PRIVACY_POLICY: LegalDocument = {
  id: 'consumer-health-data-privacy-policy',
  title: 'Consumer Health Data Privacy Policy',
  partTitle: 'Part II — Consumer Health Data Privacy Policy',
  effectiveDate: 'October 20, 2026',
  lastUpdated: 'October 20, 2026',
  preamble: [
    'This Consumer Health Data Privacy Policy supplements the BumpToBloom Privacy Policy. It explains how we collect, use, disclose, and protect information that may qualify as consumer health data under applicable state law, including the Washington My Health My Data Act when it applies.',
  ],
  contactEmail: 'team.bumptobloom@gmail.com',
  contactWebsite: 'bumptobloom.app',
  sections: [
    {
      id: 'health-data-we-collect',
      number: 1,
      title: 'Consumer Health Data We Collect',
      listItems: [
        "A child's temperature reading, measurement method, date, time, history, and related notes.",
        'Developmental milestone information.',
        'Feeding, sleeping, diaper, digestion, crying, soothing, and related parenting information.',
        "Questions or statements about a child's health, development, or wellbeing.",
        "Information about a parent's or caregiver's wellbeing that is voluntarily entered in Ask.",
        "A child's age or date of birth when connected with health or developmental information.",
        'Limited inferences needed to organize records or provide age-appropriate content.',
      ],
    },
    {
      id: 'sources-of-health-data',
      number: 2,
      title: 'Sources of Consumer Health Data',
      content:
        "Most consumer health data comes directly from you. We may also derive limited information from your entries, such as a child's age in months, or receive technical results from service providers that process a requested feature. We do not obtain medical records directly from healthcare providers, insurers, pharmacies, or electronic health-record systems.",
    },
    {
      id: 'why-we-collect-health-data',
      number: 3,
      title: 'Why We Collect and Use Consumer Health Data',
      listItems: [
        'Record and display temperatures and temperature history.',
        'Display and maintain milestone information.',
        'Provide age-appropriate educational content and requested personalization.',
        'Generate informational responses through Ask.',
        'Maintain notes and other information you choose to save.',
        'Operate, secure, troubleshoot, test, and improve the Service.',
        'Comply with applicable law.',
      ],
      content:
        'We do not use consumer health data to diagnose a condition, select treatment, determine eligibility for healthcare or insurance, or make another legal or similarly significant decision about a user.',
    },
    {
      id: 'health-data-we-disclose',
      number: 4,
      title: 'Consumer Health Data We Disclose',
      paragraphs: [
        'We do not sell consumer health data. We disclose consumer health data only as reasonably necessary to provide a feature you request, operate and secure the Service, comply with law, or act with your direction or consent.',
        'The following categories of processors may receive consumer health data:',
      ],
      listItems: [
        'Cloud hosting and database providers.',
        'Authentication and account-security providers.',
        'Artificial-intelligence and large-language-model providers.',
        'Application infrastructure, security, and error-monitoring providers.',
        'Other vendors needed to operate a feature you request.',
      ],
      callout:
        'Specific processors that may receive consumer health data: Supabase for authentication, database, and storage; Vercel for hosting and application infrastructure; and OpenAI for generating Ask responses. Ancillary services such as Sentry (error monitoring) and PostHog (product analytics) are strictly configured to exclude consumer health data and scrub any sensitive personal identifiers.',
    },
    {
      id: 'your-health-data-rights',
      number: 5,
      title: 'Your Consumer Health Data Rights',
      content: 'Depending on applicable law, you may have the right to:',
      listItems: [
        'Confirm whether we collect, disclose, or sell your consumer health data.',
        'Access consumer health data we maintain about you.',
        'Receive a list of third parties or affiliates with whom we disclosed or sold consumer health data, where required.',
        'Withdraw consent for certain collection or disclosure.',
        'Request deletion of consumer health data.',
        'Appeal a decision regarding your request.',
      ],
    },
    {
      id: 'how-to-exercise-health-rights',
      number: 6,
      title: 'How to Exercise Your Rights',
      content:
        'Submit a request to team.bumptobloom@gmail.com. We may verify your identity before acting on a request.',
    },
    {
      id: 'health-data-security',
      number: 7,
      title: 'Data Security',
      content:
        'We use reasonable administrative, technical, and organizational safeguards designed to protect information from unauthorized access, use, alteration, loss, or disclosure. However, no internet-connected system is completely secure, and we cannot guarantee absolute security.',
    },
    {
      id: 'health-data-and-ai',
      number: 8,
      title: 'Consumer Health Data and Artificial Intelligence',
      content:
        'Ask messages may contain consumer health data. AI providers may process this information only to provide the requested feature and related contracted services, subject to the provider configuration and agreement verified before publication. BumpToBloom does not authorize AI providers to use consumer health data for independent advertising or unrelated marketing.',
    },
    {
      id: 'changes-to-health-policy',
      number: 9,
      title: 'Changes to This Policy',
      content:
        'If we materially change the categories of consumer health data we collect, our purposes for collecting it, or the categories of recipients, we will update this Policy and obtain additional consent when required by law.',
    },
    {
      id: 'health-policy-contact',
      number: 10,
      title: 'Contact',
      content: 'Questions and health privacy requests may be sent to:',
    },
  ],
};
