
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Globe, Shield, Bell, Palette, Database, Code, Users } from 'lucide-react';

const AdminSettings = () => {
  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Site Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="site-name">Site Name</Label>
                <Input id="site-name" placeholder="Your Store Name" defaultValue="ShopApp" />
              </div>
              <div>
                <Label htmlFor="site-description">Site Description</Label>
                <Textarea id="site-description" placeholder="Describe your store..." />
              </div>
              <div>
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input id="contact-email" type="email" placeholder="contact@yourstore.com" />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+1 (555) 123-4567" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Regional Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" placeholder="UTC-5 (EST)" />
              </div>
              <div>
                <Label htmlFor="currency">Default Currency</Label>
                <Input id="currency" placeholder="USD" defaultValue="USD" />
              </div>
              <div>
                <Label htmlFor="language">Default Language</Label>
                <Input id="language" placeholder="English" defaultValue="English" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="maintenance-mode" />
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              </div>
              <Button>Update Settings</Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="security">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="two-factor" />
                <Label htmlFor="two-factor">Require Two-Factor Authentication</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="password-policy" />
                <Label htmlFor="password-policy">Enforce Strong Password Policy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="login-attempts" />
                <Label htmlFor="login-attempts">Limit Login Attempts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="audit-logs" />
                <Label htmlFor="audit-logs">Enable Audit Logs</Label>
              </div>
              <Button>Save Security Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="user-registration" />
                <Label htmlFor="user-registration">Allow User Registration</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="email-verification" />
                <Label htmlFor="email-verification">Require Email Verification</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="guest-checkout" />
                <Label htmlFor="guest-checkout">Allow Guest Checkout</Label>
              </div>
              <div>
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input id="session-timeout" type="number" placeholder="60" />
              </div>
              <Button>Update User Settings</Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="integrations">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Payment Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Stripe</h4>
                  <Switch />
                </div>
                <p className="text-sm text-gray-600">Process payments with Stripe</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Razorpay</h4>
                  <Switch />
                </div>
                <p className="text-sm text-gray-600">Accept payments in India</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">PayTM</h4>
                  <Switch />
                </div>
                <p className="text-sm text-gray-600">Mobile payment solution</p>
              </div>
              <Button>Configure Payment Gateways</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Email (SMTP)</h4>
                  <Switch />
                </div>
                <p className="text-sm text-gray-600">Configure email notifications</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">SMS (Twilio)</h4>
                  <Switch />
                </div>
                <p className="text-sm text-gray-600">Send SMS notifications</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">WhatsApp Business</h4>
                  <Switch />
                </div>
                <p className="text-sm text-gray-600">WhatsApp notifications</p>
              </div>
              <Button>Configure Notifications</Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="advanced">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="cache-enabled" />
                <Label htmlFor="cache-enabled">Enable Caching</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="debug-mode" />
                <Label htmlFor="debug-mode">Debug Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="compression" />
                <Label htmlFor="compression">Enable Compression</Label>
              </div>
              <div>
                <Label htmlFor="max-upload">Max Upload Size (MB)</Label>
                <Input id="max-upload" type="number" placeholder="10" />
              </div>
              <Button>Save System Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme & Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primary-color">Primary Color</Label>
                <Input id="primary-color" type="color" defaultValue="#3b82f6" />
              </div>
              <div>
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <Input id="secondary-color" type="color" defaultValue="#6b7280" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="dark-mode" />
                <Label htmlFor="dark-mode">Enable Dark Mode</Label>
              </div>
              <div>
                <Label htmlFor="logo-upload">Upload Logo</Label>
                <Input id="logo-upload" type="file" accept="image/*" />
              </div>
              <Button>Update Branding</Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default AdminSettings;
