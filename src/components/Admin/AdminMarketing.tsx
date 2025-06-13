
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Megaphone, Gift, Mail, MessageSquare, Users, BarChart3, Target, Zap } from 'lucide-react';

const AdminMarketing = () => {
  const [activeTab, setActiveTab] = useState('campaigns');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        <TabsTrigger value="coupons">Coupons</TabsTrigger>
        <TabsTrigger value="automation">Automation</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="campaigns">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Create and manage email marketing campaigns</p>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                New Email Campaign
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                SMS Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Send targeted SMS messages to customers</p>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                New SMS Campaign
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Segments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Create customer segments for targeted marketing</p>
              <Button className="w-full">
                <Target className="h-4 w-4 mr-2" />
                Create Segment
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="coupons">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Coupon Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Comprehensive coupon management system will be implemented here.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="automation">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Marketing Automation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Abandoned Cart Recovery</h3>
                <p className="text-sm text-gray-600 mb-4">Automatically send emails to customers who abandon their carts</p>
                <Button size="sm">Configure</Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Welcome Series</h3>
                <p className="text-sm text-gray-600 mb-4">Automated welcome email sequence for new customers</p>
                <Button size="sm">Configure</Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Win-back Campaigns</h3>
                <p className="text-sm text-gray-600 mb-4">Re-engage inactive customers with special offers</p>
                <Button size="sm">Configure</Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Birthday Campaigns</h3>
                <p className="text-sm text-gray-600 mb-4">Send birthday wishes with special discounts</p>
                <Button size="sm">Configure</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Marketing Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Detailed marketing analytics and performance tracking will be implemented here.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AdminMarketing;
