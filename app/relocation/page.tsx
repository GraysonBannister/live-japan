import Link from 'next/link';
import Header from '../components/Header';

export const metadata = {
  title: 'Relocation Support Services | Live Japan',
  description: 'Professional relocation support for foreigners moving to Japan. Pre-move planning, property shortlisting, application guidance, and post-move setup.',
};

export default function RelocationPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#3F51B5] to-[#283593] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Relocation Support Services
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-4">
              We reduce risk and decision friction in your high-stress transition to Japan.
            </p>
            <p className="text-lg text-white/70 mb-8">
              Not just listings. Mistake prevention, fee clarity, cultural decoding, and psychological safety.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="#packages"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#3F51B5] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                View Packages
              </Link>
              <Link 
                href="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-[#2C2416] mb-4">What You Are Actually Paying For</h2>
            <p className="text-lg text-[#78716C]">
              Relocation anxiety is monetizable. We sell clarity, risk reduction, and peace of mind.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <ValueCard 
              icon="🛡️"
              title="Mistake Prevention"
              description="Avoid costly errors in contract terms, area selection, and fee structures."
            />
            <ValueCard 
              icon="✓"
              title="Rejection Reduction"
              description="Proper documentation and application strategy to secure your home."
            />
            <ValueCard 
              icon="💴"
              title="Fee Clarity"
              description="Transparent breakdown of all upfront and ongoing costs. No surprises."
            />
            <ValueCard 
              icon="🌏"
              title="Cultural Decoding"
              description="Understand the unwritten rules of Japanese housing and neighborhoods."
            />
            <ValueCard 
              icon="😌"
              title="Psychological Safety"
              description="Expert guidance through a high-stakes, unfamiliar process."
            />
          </div>
        </div>
      </section>

      {/* 4 Phase Structure */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-[#2C2416] mb-4">Our 4-Phase Process</h2>
            <p className="text-lg text-[#78716C]">
              Structured, outcome-driven support from planning to settling in.
            </p>
          </div>

          {/* Phase 1 */}
          <PhaseSection
            number="1"
            title="Pre-Move Planning"
            subtitle="Strategy before search"
            items={[
              {
                title: 'Needs Assessment Call',
                deliverable: 'Written housing strategy summary',
                details: [
                  'Budget analysis (monthly + upfront)',
                  'Move-in date planning',
                  'Length of stay considerations',
                  'Visa status review',
                  'Guarantor situation evaluation',
                  'Workplace/school location mapping',
                  'Commute tolerance assessment',
                  'Lifestyle priorities identification',
                  'Furniture expectations',
                  'Pet status documentation',
                  'Income documentation review'
                ]
              },
              {
                title: 'Market Education',
                deliverable: 'Clear cost breakdown and area shortlist',
                details: [
                  'Monthly mansion vs regular lease comparison',
                  'Upfront cost structure explanation',
                  'Key money vs deposit clarification',
                  'Cleaning fees and hidden costs',
                  'Guarantor system navigation',
                  'Typical rejection reasons',
                  'Foreigner acceptance realities',
                  'Area-by-area pros and cons'
                ]
              }
            ]}
          />

          {/* Phase 2 */}
          <PhaseSection
            number="2"
            title="Property Shortlisting"
            subtitle="Quality over quantity"
            items={[
              {
                title: 'Curated Listing Selection',
                deliverable: 'Comparison sheet with total cost estimates',
                details: [
                  '5-10 targeted matches (not 50 random listings)',
                  'Full detail translation',
                  'Hidden fee explanation',
                  'Real total move-in cost estimation',
                  'Risk flagging for each property',
                  'Confidence scoring',
                  'Commute time calculations',
                  'Area amenity assessment'
                ]
              },
              {
                title: 'Communication Assistance',
                deliverable: 'Clear communication log and explanation',
                details: [
                  'Inquiry email drafting',
                  'Response translation',
                  'Contract clause explanation',
                  'Availability clarification',
                  'Important: We facilitate. We do not negotiate rent.'
                ]
              }
            ]}
          />

          {/* Phase 3 */}
          <PhaseSection
            number="3"
            title="Application & Contract"
            subtitle="Navigate the bureaucracy"
            items={[
              {
                title: 'Application Preparation',
                deliverable: 'Application checklist + document review',
                details: [
                  'Required documents explanation',
                  'Income proof preparation help',
                  'Visa documentation guidance',
                  'Employer letter translation',
                  'Guarantor options explanation',
                  'Application timeline management'
                ]
              },
              {
                title: 'Contract Explanation',
                deliverable: 'Plain-English contract summary',
                details: [
                  'Key clause translation',
                  'Cancellation terms explanation',
                  'Penalty fee breakdown',
                  'Renewal conditions',
                  'Check-out obligations',
                  'Important: We explain. We do not sign or hold funds.'
                ]
              }
            ]}
          />

          {/* Phase 4 */}
          <PhaseSection
            number="4"
            title="Post-Move Setup"
            subtitle="Where value multiplies"
            items={[
              {
                title: 'Utilities Setup Guidance',
                deliverable: 'Step-by-step guide with links and scripts',
                details: [
                  'Electricity activation process',
                  'Gas opening appointment scheduling',
                  'Water registration steps',
                  'Internet provider comparison',
                  'English-speaking utility companies'
                ]
              },
              {
                title: 'Resident Registration Guidance',
                deliverable: 'Registration roadmap',
                details: [
                  'Ward office registration process',
                  'National health insurance enrollment',
                  'MyNumber registration',
                  'Bank account opening basics',
                  'Required documents checklist'
                ]
              },
              {
                title: '30-Day Support Window',
                deliverable: 'Ongoing question support',
                details: [
                  'Trash separation rules',
                  'Neighborhood questions',
                  'Contract clarifications',
                  'Minor landlord communication translation',
                  'Bounded time window protects scope'
                ]
              }
            ]}
          />
        </div>
      </section>

      {/* Service Packages */}
      <section id="packages" className="py-16 sm:py-20 bg-[#F5F1E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-[#2C2416] mb-4">Service Packages</h2>
            <p className="text-lg text-[#78716C]">
              Choose the level of support that matches your needs and budget.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic */}
            <PackageCard
              name="Basic"
              price="¥30,000"
              description="Essential guidance for experienced relocators"
              features={[
                'Needs assessment call',
                'Market education session',
                '5 curated property matches',
                'Email translation (up to 10)',
                'Application checklist',
                'Basic contract summary'
              ]}
              cta="Get Started"
              popular={false}
            />

            {/* Standard */}
            <PackageCard
              name="Standard"
              price="¥70,000"
              description="Comprehensive support for most relocators"
              features={[
                'Everything in Basic',
                'Detailed contract explanation',
                'Utilities setup guide',
                'Resident registration roadmap',
                '30-day support window',
                'Priority response (24h)',
                'Video call consultations (3)'
              ]}
              cta="Most Popular"
              popular={true}
            />

            {/* Premium */}
            <PackageCard
              name="Premium"
              price="¥120,000+"
              description="White-glove service for demanding relocations"
              features={[
                'Everything in Standard',
                'Viewing coordination (Tokyo area)',
                'Phone call assistance',
                'Move-in checklist review',
                'Guarantor company coordination',
                'SIM card recommendation',
                'Bank appointment guidance',
                'Extended 60-day support',
                'Dedicated consultant'
              ]}
              cta="Contact Us"
              popular={false}
            />
          </div>

          {/* Optional Add-ons */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-[#2C2416] text-center mb-8">Optional Premium Add-Ons</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AddonCard title="In-Person Viewing" price="¥15,000/viewing" description="Accompanied property tours in Tokyo area" />
              <AddonCard title="Move-In Check" price="¥20,000" description="Professional move-in condition documentation" />
              <AddonCard title="Utility Setup Calls" price="¥10,000" description="We call utilities on your behalf" />
              <AddonCard title="Airport Pickup" price="¥25,000" description="Greeted at airport and escorted to accommodation" />
            </div>
          </div>
        </div>
      </section>

      {/* What We Avoid */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#2C2416] mb-8 text-center">What We Do NOT Do</h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-8">
              <p className="text-red-800 mb-6 text-center">
                To maintain ethical boundaries and legal compliance, we explicitly avoid:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DontDoItem text="Hold rent money or deposits" />
                <DontDoItem text="Sign contracts on your behalf" />
                <DontDoItem text="Negotiate rent for compensation" />
                <DontDoItem text="Represent ourselves as brokers" />
                <DontDoItem text="Guarantee visa approval" />
                <DontDoItem text="Promise specific properties" />
              </div>
              <p className="text-red-700 mt-6 text-center text-sm">
                Our service is structured as advisory and translation support only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#3F51B5] to-[#283593] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Make Your Move?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join hundreds of foreigners who found their home in Japan with our guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#3F51B5] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Sign Up & Get Started
            </Link>
            <a 
              href="mailto:support@livejapan.example.com"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              Contact for Questions
            </a>
          </div>
          <p className="text-white/60 mt-6 text-sm">
            Early stage: All services handled personally by our founder. High-touch, high-quality.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C2416] text-[#A8A29E] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-[#F5F1E8] text-base sm:text-lg font-bold mb-3 sm:mb-4">Live Japan</h3>
              <p className="text-sm">Making Japan accessible for foreign residents.</p>
            </div>
            <div>
              <h4 className="text-[#F5F1E8] font-semibold mb-3 sm:mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-[#F5F1E8] transition-colors">Property Search</Link></li>
                <li><Link href="/relocation" className="hover:text-[#F5F1E8] transition-colors">Relocation Support</Link></li>
                <li><Link href="/map" className="hover:text-[#F5F1E8] transition-colors">Area Map</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#F5F1E8] font-semibold mb-3 sm:mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth" className="hover:text-[#F5F1E8] transition-colors">Sign In</Link></li>
                <li><Link href="/auth" className="hover:text-[#F5F1E8] transition-colors">Sign Up</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#3D3426] mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
            <p>© 2026 Live Japan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-components
function ValueCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E7E5E4] text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-semibold text-[#2C2416] mb-2">{title}</h3>
      <p className="text-sm text-[#78716C]">{description}</p>
    </div>
  );
}

function PhaseSection({ number, title, subtitle, items }: { number: string; title: string; subtitle: string; items: any[] }) {
  return (
    <div className="mb-16">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#3F51B5] text-white flex items-center justify-center text-xl font-bold">
          {number}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-[#2C2416]">{title}</h3>
          <p className="text-[#78716C]">{subtitle}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-0 md:ml-16">
        {items.map((item, index) => (
          <div key={index} className="bg-[#F5F1E8] rounded-xl p-6">
            <h4 className="font-semibold text-[#2C2416] mb-2">{item.title}</h4>
            <p className="text-sm text-[#3F51B5] font-medium mb-4">Deliverable: {item.deliverable}</p>
            <ul className="space-y-2">
              {item.details.map((detail: string, i: number) => (
                <li key={i} className="text-sm text-[#78716C] flex items-start gap-2">
                  <span className="text-[#3F51B5] mt-1">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function PackageCard({ name, price, description, features, cta, popular }: { name: string; price: string; description: string; features: string[]; cta: string; popular: boolean }) {
  return (
    <div className={`relative bg-white rounded-2xl p-8 shadow-lg border-2 ${popular ? 'border-[#3F51B5]' : 'border-transparent'}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#3F51B5] text-white text-sm font-semibold rounded-full">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold text-[#2C2416] mb-2">{name}</h3>
      <p className="text-3xl font-bold text-[#3F51B5] mb-2">{price}</p>
      <p className="text-sm text-[#78716C] mb-6">{description}</p>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[#6B8E23] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-[#2C2416]">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Link 
        href="/auth"
        className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
          popular 
            ? 'bg-[#3F51B5] text-white hover:bg-[#283593]' 
            : 'bg-gray-100 text-[#2C2416] hover:bg-gray-200'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

function AddonCard({ title, price, description }: { title: string; price: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E7E5E4]">
      <h4 className="font-semibold text-[#2C2416] mb-1">{title}</h4>
      <p className="text-[#3F51B5] font-bold mb-2">{price}</p>
      <p className="text-sm text-[#78716C]">{description}</p>
    </div>
  );
}

function DontDoItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-red-700">
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      <span className="text-sm">{text}</span>
    </div>
  );
}
