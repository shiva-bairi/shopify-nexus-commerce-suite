
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MessageSquare, Zap, BarChart3, FileText, Users } from 'lucide-react';
import EmailCampaigns from './EmailCampaigns';
import EmailTemplates from './EmailTemplates';
import MarketingAutomation from './MarketingAutomation';
import CustomerSegments from './CustomerSegments';

const AdminMarketing = () => {
  const [activeTab, setActiveTab] = useState('campaigns');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="campaigns" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Campaigns
        </TabsTrigger>
        <TabsTrigger value="templates" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Templates
        </TabsTrigger>
        <TabsTrigger value="automation" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Automation
        </TabsTrigger>
        <TabsTrigger value="segments" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Segments
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="campaigns">
        <EmailCampaigns />
      </TabsContent>

      <TabsContent value="templates">
        <EmailTemplates />
      </TabsContent>

      <TabsContent value="automation">
        <MarketingAutomation />
      </TabsContent>

      <TabsContent value="segments">
        <CustomerSegments />
      </TabsContent>

      <TabsContent value="analytics">
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Marketing Analytics</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Comprehensive analytics dashboard for tracking campaign performance, 
            customer engagement, and ROI metrics will be implemented here.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default AdminMarketing;
