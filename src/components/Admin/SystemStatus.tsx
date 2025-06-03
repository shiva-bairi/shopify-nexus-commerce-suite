
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SystemStatus = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">✓</div>
            <p className="text-sm font-medium">Database Connected</p>
            <p className="text-xs text-gray-600">All systems operational</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">✓</div>
            <p className="text-sm font-medium">Payment Gateway</p>
            <p className="text-xs text-gray-600">Ready to process</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">✓</div>
            <p className="text-sm font-medium">Email Service</p>
            <p className="text-xs text-gray-600">Notifications active</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatus;
