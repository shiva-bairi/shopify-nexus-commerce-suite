
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MessageCircle, Phone, Mail, HelpCircle, Book, Clock } from 'lucide-react';

const Support = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by logging into your account and viewing your order history, or use the tracking number sent to your email."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy on most items. Items must be in original condition with tags attached."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 5-7 business days, Express shipping takes 2-3 business days, and Overnight shipping takes 1 business day."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to over 100 countries worldwide. International shipping typically takes 7-21 business days."
    },
    {
      question: "How can I change or cancel my order?",
      answer: "You can modify or cancel your order within 2 hours of placing it by contacting customer service or through your account dashboard."
    }
  ];

  const supportChannels = [
    {
      name: "Live Chat",
      description: "Get instant help from our support team",
      availability: "24/7",
      icon: MessageCircle,
      status: "online"
    },
    {
      name: "Phone Support",
      description: "Speak directly with a support representative",
      availability: "Mon-Fri 9AM-6PM EST",
      icon: Phone,
      status: "available"
    },
    {
      name: "Email Support",
      description: "Send us a detailed message",
      availability: "Response within 24 hours",
      icon: Mail,
      status: "available"
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Support Center</h1>
      
      {/* Search Bar */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search for help articles, FAQs, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq" className="flex items-center space-x-2">
            <HelpCircle className="h-4 w-4" />
            <span>FAQ</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Contact Us</span>
          </TabsTrigger>
          <TabsTrigger value="guides" className="flex items-center space-x-2">
            <Book className="h-4 w-4" />
            <span>Guides</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFaqs.length > 0 ? (
                <div className="space-y-4">
                  {filteredFaqs.map((faq, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <h3 className="font-semibold mb-2">{faq.question}</h3>
                        <p className="text-gray-700">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No FAQs found matching your search.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportChannels.map((channel, index) => {
              const IconComponent = channel.icon;
              return (
                <Card key={index}>
                  <CardHeader className="text-center">
                    <IconComponent className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                    <CardTitle className="text-lg">{channel.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-3">{channel.description}</p>
                    <Badge 
                      variant={channel.status === 'online' ? 'default' : 'secondary'}
                      className="mb-3"
                    >
                      {channel.status === 'online' ? 'Online' : 'Available'}
                    </Badge>
                    <p className="text-sm text-gray-500 mb-4">{channel.availability}</p>
                    <Button className="w-full">
                      {channel.name === 'Live Chat' ? 'Start Chat' :
                       channel.name === 'Phone Support' ? 'Call Now' : 'Send Email'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="guides">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Getting Started",
                description: "Learn how to create an account and place your first order",
                topics: ["Account Setup", "First Purchase", "Payment Methods"]
              },
              {
                title: "Order Management", 
                description: "Everything about managing your orders and tracking",
                topics: ["Order Tracking", "Modifications", "Cancellations"]
              },
              {
                title: "Returns & Refunds",
                description: "Complete guide to our return and refund process",
                topics: ["Return Policy", "How to Return", "Refund Timeline"]
              },
              {
                title: "Shipping Guide",
                description: "All about our shipping options and policies",
                topics: ["Shipping Methods", "International", "Delivery Issues"]
              },
              {
                title: "Account & Security",
                description: "Manage your account settings and security",
                topics: ["Profile Settings", "Password Security", "Privacy"]
              },
              {
                title: "Payment Help",
                description: "Payment methods, billing, and transaction issues",
                topics: ["Payment Options", "Billing Issues", "Security"]
              }
            ].map((guide, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{guide.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{guide.description}</p>
                  <div className="space-y-2">
                    {guide.topics.map((topic, topicIndex) => (
                      <Button key={topicIndex} variant="ghost" size="sm" className="w-full justify-start">
                        {topic}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Support;
