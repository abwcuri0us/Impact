'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Brain,
  Sparkles,
  TrendingUp,
  Briefcase,
  ChevronRight,
  MessageSquareText,
  Image as ImageIcon,
  Video,
  FileText,
  Bot,
  Cpu,
  Lightbulb,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import FadeIn from '@/components/shared/FadeIn';
import SectionHeading from '@/components/shared/SectionHeading';

const aiTools = [
  {
    name: 'ChatGPT',
    logo: '/logo-chatgpt.png',
    category: 'AI Chatbot',
    description: 'The world\'s most popular AI assistant by OpenAI. From answering questions to writing code, essays, and creative content, ChatGPT revolutionizes how we interact with technology. Students learn to craft effective prompts, generate professional documents, automate repetitive tasks, and enhance their daily productivity using conversational AI.',
    color: 'from-emerald-500 to-teal-600',
    link: 'https://chat.openai.com',
  },
  {
    name: 'Google Gemini',
    logo: '/logo-gemini.png',
    category: 'Multimodal AI',
    description: 'Google\'s advanced AI model that understands text, images, audio, and video together. Gemini excels at multimodal reasoning, helping students analyze complex information across different formats. It integrates seamlessly with Google Workspace, making it an indispensable tool for research, data analysis, and collaborative projects.',
    color: 'from-blue-500 to-indigo-600',
    link: 'https://gemini.google.com',
  },
  {
    name: 'Claude',
    logo: '/logo-claude.png',
    category: 'AI Assistant',
    description: 'Anthropic\'s Claude is known for its safety-first approach and nuanced understanding of complex topics. It handles long documents, detailed analysis, and thoughtful responses with exceptional accuracy. Students use Claude for research paper summaries, document review, coding assistance, and academic writing support.',
    color: 'from-orange-400 to-amber-600',
    link: 'https://claude.ai',
  },
  {
    name: 'Perplexity',
    logo: '/logo-perplexity.png',
    category: 'AI Search Engine',
    description: 'An AI-powered search engine that provides direct, cited answers instead of just links. Perplexity transforms research by synthesizing information from multiple sources with proper citations. Students learn to use it for academic research, fact-checking, market analysis, and staying updated with real-time information.',
    color: 'from-cyan-500 to-blue-600',
    link: 'https://perplexity.ai',
  },
  {
    name: 'Microsoft Copilot',
    logo: '/logo-microsoft-copilot.png',
    category: 'AI Productivity',
    description: 'Deeply integrated into Microsoft 365 apps including Word, Excel, PowerPoint, and Outlook. Copilot helps create presentations, analyze spreadsheets, draft emails, and generate reports using natural language commands. Essential for modern office professionals looking to supercharge their Microsoft Office workflow.',
    color: 'from-sky-500 to-blue-700',
    link: 'https://copilot.microsoft.com',
  },
  {
    name: 'Runway',
    logo: '/logo-runway.png',
    category: 'AI Video Generation',
    description: 'The leading AI video generation platform that transforms text prompts into professional-quality videos. Runway enables creative professionals to generate stunning visual content, apply cinematic effects, and create video edits using AI. Students explore AI-powered video editing, motion graphics, and creative content production.',
    color: 'from-purple-500 to-violet-700',
    link: 'https://runwayml.com',
  },
  {
    name: 'Stable Diffusion',
    logo: '/logo-stable-diffusion.png',
    category: 'AI Image Generation',
    description: 'A powerful open-source AI image generation model that creates stunning artwork from text descriptions. Students learn prompt engineering, image-to-image transformation, inpainting, and control techniques. Stable Diffusion is widely used in graphic design, concept art, marketing materials, and creative projects.',
    color: 'from-pink-500 to-rose-600',
    link: 'https://stability.ai',
  },
  {
    name: 'Gamma',
    logo: '/logo-gamma.png',
    category: 'AI Presentations',
    description: 'Create beautiful, professional presentations, documents, and web pages in seconds using AI. Gamma transforms simple text prompts into visually stunning slide decks with proper layouts, images, and formatting. Perfect for students and professionals who need to deliver impactful presentations quickly and efficiently.',
    color: 'from-amber-400 to-orange-600',
    link: 'https://gamma.app',
  },
  {
    name: 'Sora',
    logo: '/logo-sora.png',
    category: 'AI Video Creation',
    description: 'OpenAI\'s groundbreaking text-to-video model that generates realistic, minute-long videos from text instructions. Sora represents the cutting edge of AI video creation, capable of producing complex scenes with multiple characters, accurate physics, and cinematic quality. Students explore the future of video content creation.',
    color: 'from-indigo-500 to-purple-700',
    link: 'https://openai.com/sora',
  },
  {
    name: 'Leonardo AI',
    logo: '/logo-leonardo-ai.png',
    category: 'AI Art & Design',
    description: 'A premium AI art generation platform tailored for designers, game developers, and creative professionals. Leonardo AI offers fine-tuned models for concept art, character design, texture generation, and marketing visuals. Students learn to create production-quality artwork for games, branding, and digital media projects.',
    color: 'from-amber-500 to-yellow-700',
    link: 'https://leonardo.ai',
  },
  {
    name: 'Midjourney',
    logo: '/logo-midjourney.png',
    category: 'AI Art Generation',
    description: 'One of the most popular AI art generators known for its exceptional artistic quality and unique aesthetic style. Midjourney creates breathtaking illustrations, concept art, and visual designs from text prompts. Students master prompt crafting, style control, and creative workflows used by professional artists and designers worldwide.',
    color: 'from-blue-600 to-cyan-700',
    link: 'https://midjourney.com',
  },
  {
    name: 'Anthropic',
    logo: '/logo-anthropic.png',
    category: 'AI Safety & Research',
    description: 'Anthropic is a leading AI safety company focused on building reliable, interpretable, and steerable AI systems. Their research in AI safety, responsible AI development, and constitutional AI shapes the future of the industry. Students understand the importance of AI ethics, safety measures, and responsible AI deployment.',
    color: 'from-stone-500 to-neutral-700',
    link: 'https://anthropic.com',
  },
];

const learningPaths = [
  {
    icon: Bot,
    title: 'AI Chatbot Mastery',
    description: 'Master conversational AI tools including ChatGPT, Claude, and Gemini. Learn prompt engineering, context management, and how to leverage AI assistants for research, writing, coding, and problem-solving across academic and professional scenarios.',
    tools: ['ChatGPT', 'Claude', 'Gemini'],
  },
  {
    icon: ImageIcon,
    title: 'AI Creative Studio',
    description: 'Explore the world of AI-powered visual content creation. Generate stunning images, artwork, and designs using Stable Diffusion, Midjourney, and Leonardo AI. Understand prompt crafting, style control, and how AI is transforming the creative industry.',
    tools: ['Stable Diffusion', 'Midjourney', 'Leonardo AI'],
  },
  {
    icon: Video,
    title: 'AI Video & Media',
    description: 'Discover how AI is revolutionizing video production and content creation. From text-to-video generation with Sora to AI-powered editing with Runway, learn the tools and techniques that are reshaping media production and digital storytelling.',
    tools: ['Sora', 'Runway', 'Gamma'],
  },
  {
    icon: FileText,
    title: 'AI Productivity Suite',
    description: 'Boost your productivity with AI-powered office tools. Learn to use Microsoft Copilot for document creation, Perplexity for research, and AI writing assistants for professional communication. Transform how you work, study, and collaborate.',
    tools: ['Microsoft Copilot', 'Perplexity', 'Gamma'],
  },
];

const aiBenefits = [
  {
    icon: Zap,
    title: '10x Productivity',
    description: 'Automate repetitive tasks and accomplish in minutes what used to take hours. AI tools help you work smarter by handling routine work like data formatting, email drafting, and report generation.',
  },
  {
    icon: Lightbulb,
    title: 'Creative Enhancement',
    description: 'AI doesn\'t replace creativity — it amplifies it. Generate ideas, create visual content, and explore artistic possibilities that were previously out of reach for non-specialists.',
  },
  {
    icon: Cpu,
    title: 'Industry Readiness',
    description: 'Every industry is adopting AI. From healthcare to finance, marketing to education — AI literacy is becoming as fundamental as computer literacy was a decade ago.',
  },
  {
    icon: TrendingUp,
    title: 'Career Acceleration',
    description: 'Professionals with AI skills command higher salaries and better opportunities. Stand out in job interviews and workplace performance by demonstrating practical AI tool proficiency.',
  },
];

export default function AILearningPage() {
  return (
    <div className="pt-20 sm:pt-[136px] lg:pt-[160px]">
      {/* ═══ Hero Section ═══ */}
      <section className="py-10 md:py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-80 h-80 bg-brand-yellow rounded-full blur-[100px]" />
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-brand-purple-light rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            light
            badge={<><Brain className="w-4 h-4 mr-1.5 inline" /> AI-Powered Learning</>}
            title="Step Into the World of AI"
            subtitle="We're not just teaching computers anymore. We're preparing you for the future with AI awareness integrated into every course."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: 'AI Fundamentals',
                description: 'Understand what Artificial Intelligence is, how it works, and why it matters. Learn the basics of machine learning and AI tools that are reshaping industries.',
              },
              {
                icon: Sparkles,
                title: 'AI in Daily Work',
                description: 'Learn how to use AI tools like ChatGPT, AI-powered Excel features, and smart assistants to boost your productivity and work smarter, not harder.',
              },
              {
                icon: TrendingUp,
                title: 'Future-Ready Skills',
                description: 'Stay ahead of the curve. Our curriculum evolves with technology to ensure you learn skills that employers are actively looking for in 2025 and beyond.',
              },
              {
                icon: Briefcase,
                title: 'AI for Career Growth',
                description: 'Discover how AI knowledge can open new career opportunities. From data analysis to digital marketing, AI skills give you a competitive edge.',
              },
            ].map((item, index) => (
              <FadeIn key={item.title} delay={index * 0.15}>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 group h-full">
                  <div className="w-14 h-14 rounded-2xl bg-brand-yellow/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-7 h-7 text-brand-yellow" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AI Tools Showcase ═══ */}
      <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge={<><Cpu className="w-4 h-4 mr-1.5 inline" /> Tools You'll Master</>}
            title="AI Tools We Teach"
            subtitle="Get hands-on experience with the most powerful and widely-used AI tools in the industry. From chatbots to video generators, we cover the complete AI ecosystem."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {aiTools.map((tool, index) => (
              <FadeIn key={tool.name} delay={index * 0.06}>
                <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-brand-purple/30 transition-all duration-300 group h-full flex flex-col">
                  {/* Gradient Top Bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${tool.color}`} />
                  <div className="p-6 flex flex-col flex-1">
                    {/* Logo + Category */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-muted/80 border border-border flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <Image
                          src={tool.logo}
                          alt={tool.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold group-hover:text-brand-purple transition-colors">{tool.name}</h3>
                        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${tool.color} text-white mt-1`}>
                          {tool.category}
                        </span>
                      </div>
                    </div>
                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {tool.description}
                    </p>
                    {/* Visit Link */}
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-purple hover:text-brand-purple-dark mt-4 transition-colors"
                    >
                      Visit {tool.name} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Learning Paths ═══ */}
      <section className="py-16 md:py-24 lg:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge={<><MessageSquareText className="w-4 h-4 mr-1.5 inline" /> Learning Paths</>}
            title="Choose Your AI Journey"
            subtitle="Whether you want to master AI chatbots, create stunning visuals, produce videos, or boost your productivity — we have a structured learning path for you."
          />

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {learningPaths.map((path, index) => (
              <FadeIn key={path.title} delay={index * 0.12}>
                <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 hover:shadow-xl hover:border-brand-purple/30 transition-all duration-300 h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-purple/10 flex items-center justify-center shrink-0">
                      <path.icon className="w-6 h-6 text-brand-purple" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{path.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {path.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {path.tools.map((tool) => (
                      <span key={tool} className="text-xs font-medium px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Why Learn AI ═══ */}
      <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-brand-yellow rounded-full blur-[80px]" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-brand-purple-light rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            light
            badge={<><Zap className="w-4 h-4 mr-1.5 inline" /> Why AI Matters</>}
            title="Why You Need AI Skills"
            subtitle="AI is not the future — it's the present. Every industry is transforming, and those who adapt will thrive."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {aiBenefits.map((benefit, index) => (
              <FadeIn key={benefit.title} delay={index * 0.12}>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 group h-full">
                  <div className="w-12 h-12 rounded-xl bg-brand-yellow/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="w-6 h-6 text-brand-yellow" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA Section ═══ */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-brand-purple" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Start Your AI Journey?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-3">
                Every course at Impact Computers now includes AI awareness modules at no extra cost. Learn the tools that are reshaping industries worldwide.
              </p>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-8">
                From ChatGPT and Claude to Midjourney and Sora — get hands-on training with the AI tools used by professionals across every industry.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/enquiry">
                  <Button size="lg" className="bg-brand-purple text-white hover:bg-brand-purple-dark font-bold px-8 shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto">
                    Enroll Now
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button size="lg" variant="outline" className="font-bold px-8 border-brand-purple/30 hover:bg-brand-purple/5 w-full sm:w-auto">
                    View All Courses
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
