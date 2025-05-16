import { ArrowRight, MessageSquare, ShieldCheck, Zap, Brain, Award, ChevronRight } from 'lucide-react';
import BackgroundAnimation from './components/BackgroundAnimation';
import { Header } from './components/Header';
import { Lusitana } from 'next/font/google';
import Link from 'next/link';
import DemoChat from './components/DemoChat';
import Footer from './components/Footer';
import { LucideIcon } from 'lucide-react';

const lusitana = Lusitana({ subsets: ['latin'], weight: ['400', '700'] });

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  className?: string;
}

// Feature card component
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  const Icon = icon;

  return (
    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/80 transition-colors hover:border-sky-800/50 group">
      <div className="h-12 w-12 rounded-lg bg-sky-900/30 flex items-center justify-center mb-4 group-hover:bg-sky-900/50 transition-colors">
        <Icon size={24} className="text-sky-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-300">{description}</p>
    </div>
  );
};

// Testimonial component
const Testimonial: React.FC<TestimonialProps> = ({ quote, author, role, avatar }) => {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center mb-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
          {avatar}
        </div>
        <div className="ml-4">
          <h4 className="font-semibold text-white">{author}</h4>
          <p className="text-slate-400 text-sm">{role}</p>
        </div>
      </div>
      <p className="text-slate-300 italic">&quot;{quote}&quot;</p>
    </div>
  );
};

export default function AIChatbotHomepage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Background Animation */}
      <BackgroundAnimation />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/80 to-slate-900"></div>

      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                The Next Generation <span className={`bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500 ${lusitana.className}`}>AI Assistant</span> At Your Fingertips
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                Experience the most advanced conversational AI with stunning 3D interfaces and unmatched intelligence.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/chat" className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-medium flex items-center justify-center">
                  Start Chatting Now <ArrowRight size={18} className="ml-2" />
                </Link>
                <a href="#" className="px-6 py-3 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white font-medium flex items-center justify-center hover:bg-slate-800 transition-colors">
                  Watch Demo
                </a>
              </div>
            </div>

            <DemoChat />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-16 md:py-24 bg-slate-900/70">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by Advanced AI Technology</h2>
            <p className="text-xl text-slate-300">
              Experience the most sophisticated conversational AI with capabilities that go beyond simple chatbots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Brain}
              title="Advanced Intelligence"
              description="Using state-of-the-art language models to understand context and provide insightful responses."
            />
            <FeatureCard 
              icon={Zap}
              title="Lightning Fast"
              description="Get responses in milliseconds with our optimized AI processing infrastructure."
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Secure & Private"
              description="Your conversations are encrypted and never stored or used to train our models without consent."
            />
            <FeatureCard 
              icon={MessageSquare}
              title="Natural Conversations"
              description="Engage in flowing, human-like dialogue that feels natural and intuitive."
            />
            <FeatureCard 
              icon={Award}
              title="Premium Experience"
              description="Enjoy a sleek, futuristic interface with 3D animations and responsive design."
            />
            <div className="bg-gradient-to-r from-sky-900/50 to-indigo-900/50 backdrop-blur-md border border-sky-700/20 rounded-xl p-6 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sky-400 font-medium mb-2">Ready to try it?</p>
                <Link href="/chat" className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-slate-900 font-medium hover:bg-sky-100 transition-colors">
                  Try Nova Now <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-slate-300">
              Join thousands of satisfied users already leveraging our AI assistant.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Testimonial 
              quote="NOVA AI has completely transformed how I handle data analysis. The interface is gorgeous and the AI is incredibly intelligent."
              author="Sarah Johnson"
              role="Data Scientist"
              avatar="SJ"
            />
            <Testimonial 
              quote="The 3D interface is mind-blowing! I've tried other AI assistants but nothing comes close to this experience."
              author="Michael Chen"
              role="UX Designer"
              avatar="MC"
            />
            <Testimonial 
              quote="As a developer, I appreciate the attention to detail. The responses are accurate and the UI is exceptionally well-crafted."
              author="Alex Rodriguez"
              role="Software Engineer"
              avatar="AR"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience the Future of AI?</h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of users already leveraging our next-generation AI assistant for productivity, creativity, and more.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/chat" className="px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-medium flex items-center justify-center text-lg">
                Try Nova for Free
              </Link>
              <Link href="/" className="px-8 py-4 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white font-medium flex items-center justify-center text-lg hover:bg-slate-800 transition-colors">
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}