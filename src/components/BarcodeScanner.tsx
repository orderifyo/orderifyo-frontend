import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBarcode } from '@/contexts/BarcodeContext';
import { 
  ScanBarcode, Sparkles, QrCode, Table, ArrowRight, 
  CheckCircle, TableProperties, Coffee, Utensils
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BarcodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanAnimation, setScanAnimation] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [recentScans, setRecentScans] = useState<string[]>([]);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const scannerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { setActiveBarcode } = useBarcode();
  const [manualBarcode, setManualBarcode] = useState('');

  // Track viewport height changes
  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Also handle zoom changes
    document.addEventListener('gestureend', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      document.removeEventListener('gestureend', handleResize);
    };
  }, []);

  // Animation on mount
  useEffect(() => {
    setMounted(true);
    
    // Check local storage for recent scans
    const savedScans = localStorage.getItem('recentTableScans');
    if (savedScans) {
      try {
        setRecentScans(JSON.parse(savedScans).slice(0, 3));
      } catch (e) {
        console.error('Error parsing saved scans');
      }
    }
  }, []);

  // Calculate scanner size dynamically based on viewport
  const getScannerSize = () => {
    const isMobile = window.innerWidth < 640;
    // For very small screens, use a smaller scanner
    if (viewportHeight < 600) {
      return { height: '180px' };
    }
    // For small screens, use a medium scanner
    else if (viewportHeight < 750) {
      return { height: '240px' };
    }
    // For normal screens, use a standard size
    else {
      return { height: isMobile ? '280px' : '320px' };
    }
  };

  // Mock function to simulate finding a barcode after a delay
  const startScanningMock = () => {
    setIsScanning(true);
    setScanAnimation(true);
    
    // Try to play scan sound, but don't break if audio isn't supported
    try {
      const audio = new Audio('/scan-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio play prevented:', e));
    } catch (e) {
      console.log('Audio not supported');
    }
    
    // Simulate scanning delay
    setTimeout(() => {
      // Generate a random table ID between 1 and 15
      const mockTableId = `TABLE-${Math.floor(Math.random() * 15) + 1}`;
      
      setScanAnimation(false);
      
      // Short delay before completing the scan for better UX
      setTimeout(() => {
        setIsScanning(false);
        setActiveBarcode(mockTableId);
        
        // Add to recent scans
        const updatedScans = [mockTableId, ...recentScans.filter(id => id !== mockTableId)].slice(0, 3);
        setRecentScans(updatedScans);
        localStorage.setItem('recentTableScans', JSON.stringify(updatedScans));
        
        // Show success toast
        toast.success(`Connected to ${mockTableId}`, {
          icon: <CheckCircle className="h-4 w-4 text-emerald-400" />,
          className: "dark-toast text-white font-medium",
          description: "Opening chat session...",
        });
        
        navigate(`/chat/${mockTableId}`);
      }, 500);
    }, 2000);
  };
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      const formattedBarcode = manualBarcode.trim().toUpperCase();
      setActiveBarcode(formattedBarcode);
      
      // Add to recent scans
      const updatedScans = [formattedBarcode, ...recentScans.filter(id => id !== formattedBarcode)].slice(0, 3);
      setRecentScans(updatedScans);
      localStorage.setItem('recentTableScans', JSON.stringify(updatedScans));
      
      toast.success(`Connected to ${formattedBarcode}`, {
        icon: <CheckCircle className="h-4 w-4 text-emerald-400" />,
        className: "dark-toast text-white font-medium",
        description: "Opening chat session...",
      });
      
      navigate(`/chat/${formattedBarcode}`);
    }
  };
  
  const connectToRecentTable = (tableId: string) => {
    setActiveBarcode(tableId);
    toast.success(`Reconnecting to ${tableId}`, {
      icon: <CheckCircle className="h-4 w-4 text-emerald-400" />,
      className: "dark-toast text-white font-medium",
    });
    navigate(`/chat/${tableId}`);
  };

  // Cancel scanning if user navigates away
  useEffect(() => {
    return () => {
      setIsScanning(false);
      setScanAnimation(false);
    };
  }, []);

  // Get dynamic scanner size
  const scannerStyle = getScannerSize();
  
  // Show/hide feature highlights based on screen size
  const shouldShowFeatures = viewportHeight > 700;

  return (
    <div className={`flex flex-col items-center justify-start p-4 sm:p-6 w-full max-w-md mx-auto transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Logo and Header */}
      <div className="text-center mb-4 sm:mb-6 scale-in-center">
        <div className="relative flex flex-col items-center">
          <div className="absolute -inset-10 bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-xl"></div>
          <div className="flex items-center justify-center mb-2 relative">
            <div className="relative mr-2">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text px-3 py-1 tracking-tight">
              TableChat
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-xs">
            Scan your table's QR code or enter your unique table number
          </p>
        </div>
      </div>
      
      {/* Scanner Area with dynamic sizing */}
      <div 
        ref={scannerRef}
        style={scannerStyle}
        className={`scanner-area w-full rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300 ${
          isScanning 
            ? "border-4 border-purple-500 shadow-lg shadow-purple-500/30" 
            : "border-2 border-dashed border-purple-500/30 bg-zinc-800/50 backdrop-blur-sm"
        }`}
      >
        {isScanning ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Camera background simulation */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black opacity-90"></div>
            
            {/* Camera grid overlay */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array(9).fill(0).map((_, i) => (
                <div key={i} className="border border-purple-500/10"></div>
              ))}
            </div>
            
            {/* Scanner effects */}
            {scanAnimation && (
              <>
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/70 shadow-lg shadow-purple-500/50 animate-scan-down"></div>
                <div className="absolute inset-0 bg-purple-500/5 animate-pulse"></div>
              </>
            )}
            
            {/* Camera viewfinder */}
            <div className="relative z-10">
              <div className="w-32 h-32 sm:w-48 sm:h-48 border-2 border-purple-500 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <QrCode size={viewportHeight < 700 ? 32 : 48} className="text-purple-400 animate-pulse" />
                <div className="absolute top-0 left-0 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-l-2 border-purple-500 rounded-tl"></div>
                <div className="absolute top-0 right-0 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-r-2 border-purple-500 rounded-tr"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-l-2 border-purple-500 rounded-bl"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-r-2 border-purple-500 rounded-br"></div>
              </div>
            </div>
            
            {/* Scanning glow */}
            <div className="absolute inset-0 bg-gradient-radial from-purple-500/0 to-purple-500/20 animate-pulse pointer-events-none"></div>
          </div>
        ) : (
          <div className="text-zinc-400 flex flex-col items-center p-4">
            <div className="relative mb-3 scanner-idle-glow">
              <ScanBarcode size={viewportHeight < 700 ? 40 : 48} className="text-purple-500/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <QrCode size={viewportHeight < 700 ? 16 : 20} className="text-purple-400/80" />
              </div>
            </div>
            <p className="font-medium text-purple-300 text-sm sm:text-base">Ready to scan</p>
            <p className="text-xs text-center mt-1 max-w-xs text-zinc-400">
              Position your table's QR code within the scanner area
            </p>
          </div>
        )}
      </div>
      
      {/* Action Button */}
      <Button 
        onClick={startScanningMock} 
        disabled={isScanning}
        className="action-button w-full mt-4 sm:mt-6 mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-3 sm:py-5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-purple-600/30 relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center justify-center">
          {isScanning ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <span>Start Scanning</span>
              <ScanBarcode className="ml-2 h-4 w-4 group-hover:animate-pulse" />
            </>
          )}
        </span>
        
        {/* Button glowing border effect */}
        <span className="hover-effect absolute inset-px rounded-lg bg-gradient-to-r from-purple-500/50 via-purple-300/50 to-blue-500/50 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300"></span>
        
        {/* Button highlight effect */}
        <span className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-300/40 to-blue-300/40 translate-y-1 group-hover:translate-y-0 transition-transform duration-300"></span>
      </Button>
      

{/* Manual Entry Section */}
<div className="w-full">
  <div className="relative flex items-center">
    <div className="flex-grow border-t border-zinc-700/50"></div>
    <span className="flex-shrink mx-4 text-zinc-400 text-xs sm:text-sm font-medium">or enter code</span>
    <div className="flex-grow border-t border-zinc-700/50"></div>
  </div>
  
  <form onSubmit={handleManualSubmit} className="mt-3 sm:mt-4">
    <div className="flex space-x-2">
      <input
        type="text"
        value={manualBarcode}
        onChange={(e) => setManualBarcode(e.target.value)}
        placeholder="Enter table code (e.g. TABLE-5)"
        className="flex-1 p-3 sm:p-4 bg-zinc-800/70 backdrop-blur-sm border border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 placeholder:text-zinc-500 text-zinc-100 text-sm"
      />
      <Button 
        type="submit" 
        variant="outline" 
        className="border-purple-500/50 text-purple-400 bg-zinc-800/70 hover:bg-purple-600 hover:text-white px-3 sm:px-4 h-[48px] sm:h-[56px] flex items-center justify-center group"
      >
        <ArrowRight className="h-5 w-5 transition-transform duration-300 transform group-hover:translate-x-1" />
      </Button>
    </div>
  </form>
</div>

      {/* Recent connections section */}
      {recentScans.length > 0 && (
        <div className="recent-connections w-full mb-4 sm:mb-6">
          <div className="relative flex items-center mt-3 mb-2 sm:mb-3">
            <div className="flex-grow border-t border-zinc-700/50"></div>
            <span className="flex-shrink mx-4 text-zinc-400 text-xs sm:text-sm font-medium">recent connections</span>
            <div className="flex-grow border-t border-zinc-700/50"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {recentScans.map((tableId, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => connectToRecentTable(tableId)}
                className="touch-feedback w-full py-2 sm:py-3 px-3 sm:px-4 bg-purple-600/40 hover:bg-purple-600/20 border border-zinc-700/50 hover:border-purple-500/50 text-left flex items-center justify-between group transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-zinc-700/50 flex items-center justify-center mr-2 sm:mr-3 group-hover:bg-purple-600/30 transition-colors duration-200">
                    <TableProperties className="h-3 w-3 sm:h-4 sm:w-4 text-zinc-300 group-hover:text-purple-300" />
                  </div>
                  <span className="text-zinc-300 text-sm group-hover:text-purple-200">{tableId}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-purple-300 transition-transform duration-300 transform group-hover:translate-x-1" />
              </Button>
            ))}
          </div>
        </div>
      )}

{/* Feature highlights */}
{shouldShowFeatures && (
  <div className="feature-highlights w-full mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-3">
    <div className="bg-zinc-800/40 backdrop-blur-sm border border-zinc-700/40 rounded-lg p-2 sm:p-3 flex flex-col items-center text-center group hover:bg-purple-900/10 hover:border-purple-500/30 transition-all duration-300">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
        <Coffee className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
      </div>
      <h3 className="text-xs font-medium text-zinc-300 group-hover:text-purple-200">Order Drinks</h3>
    </div>
    
    <div className="bg-zinc-800/40 backdrop-blur-sm border border-zinc-700/40 rounded-lg p-2 sm:p-3 flex flex-col items-center text-center group hover:bg-purple-900/10 hover:border-purple-500/30 transition-all duration-300">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
        <Utensils className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
      </div>
      <h3 className="text-xs font-medium text-zinc-300 group-hover:text-purple-200">Request Menu</h3>
    </div>
    
    <div className="bg-zinc-800/40 backdrop-blur-sm border border-zinc-700/40 rounded-lg p-2 sm:p-3 flex flex-col items-center text-center group hover:bg-purple-900/10 hover:border-purple-500/30 transition-all duration-300">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
        <TableProperties className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
      </div>
      <h3 className="text-xs font-medium text-zinc-300 group-hover:text-purple-200">Table Service</h3>
    </div>
  </div>
)}

{/* Help Text */}
<div className="help-text mt-4 sm:mt-6 text-center text-xs text-zinc-500 mb-4">
  <p>Can't find your table code? Ask a staff member for assistance</p>
</div>

{/* Ambient background effect */}
<div className="ambient-effect fixed -z-10 inset-0 overflow-hidden pointer-events-none">
  <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl"></div>
  <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl"></div>
</div>
</div>
);
}

export default BarcodeScanner;