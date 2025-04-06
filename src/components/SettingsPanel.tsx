
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Settings, Key } from 'lucide-react';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ open, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  const handleSaveSettings = () => {
    // In a real app, you would securely store the API key
    localStorage.setItem('openai_api_key', apiKey);
    toast({
      title: "Settings saved",
      description: "Your API key has been saved."
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-t-4 border-t-canon-purple">
        <DialogHeader className="flex flex-row items-center gap-2">
          <Settings className="h-5 w-5 text-canon-purple" />
          <DialogTitle className="font-serif">Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Key className="h-4 w-4 mr-2 text-canon-purple" />
              <Label htmlFor="api-key">OpenAI API Key</Label>
            </div>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground pl-6">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>
          
          {/* Additional settings would go here */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSaveSettings} className="btn-hover-effect">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPanel;
