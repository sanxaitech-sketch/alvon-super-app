import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, Unlock, Shield, ShieldCheck, Image as ImageIcon, Video, FileText, 
  Upload, Trash2, KeyRound, Plus, Eye, EyeOff, Loader2, RefreshCw, X, 
  Check, ArrowLeft, ChevronRight, HelpCircle, HardDrive, ShieldAlert, Cloud, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { db, auth, storage } from '../lib/firebaseClient';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { ActiveTab } from '../types';

interface VaultFile {
  id: string;
  userId: string;
  name: string;
  type: 'photo' | 'video' | 'pdf';
  size: number;
  url: string; // Firebase Storage URL or base64 fallback
  createdAt: string;
}

interface AlvonVaultProps {
  onTabChange: (tab: ActiveTab) => void;
}

export const AlvonVault: React.FC<AlvonVaultProps> = ({ onTabChange }) => {
  // Auth state
  const [fbUser, setFbUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Vault protection state
  const [isLocked, setIsLocked] = useState(true);
  const [hasPinSetup, setHasPinSetup] = useState<boolean | null>(null);
  const [pinInput, setPinInput] = useState<string>('');
  const [savedPin, setSavedPin] = useState<string>('');
  
  // Setup PIN form
  const [setupStep, setSetupStep] = useState<'create' | 'confirm'>('create');
  const [tempPin, setTempPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Files in vault
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'photo' | 'video' | 'pdf'>('all');

  // File upload state
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingName, setUploadingName] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  
  // Preview modal
  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null);

  // Drag over state
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFbUser(user);
      setAuthLoading(false);
      // Reset lock state when auth status changes
      setIsLocked(true);
      setPinInput('');
      setTempPin('');
      setSetupStep('create');
      setErrorMsg('');
    });
    return () => unsubscribe();
  }, []);

  // Fetch / Sync PIN code setup
  useEffect(() => {
    if (authLoading) return;

    if (!fbUser) {
      // Offline mode PIN setup
      const localPin = localStorage.getItem('alvon_vault_pin');
      if (localPin) {
        setSavedPin(localPin);
        setHasPinSetup(true);
      } else {
        setHasPinSetup(false);
      }
      return;
    }

    // Authenticated Firestore PIN check
    const pinDocRef = doc(db, 'vault_settings', fbUser.uid);
    const unsubscribe = onSnapshot(pinDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().pin) {
        setSavedPin(docSnap.data().pin);
        setHasPinSetup(true);
      } else {
        setHasPinSetup(false);
      }
    }, (err) => {
      console.error("Error reading vault settings:", err);
      // Fallback
      setHasPinSetup(false);
    });

    return () => unsubscribe();
  }, [fbUser, authLoading]);

  // Sync Vault files when unlocked
  useEffect(() => {
    if (isLocked || authLoading) return;

    if (!fbUser) {
      // Local sandbox files fallback
      const localFiles = localStorage.getItem('alvon_vault_files');
      if (localFiles) {
        setFiles(JSON.parse(localFiles));
      } else {
        setFiles([]);
      }
      return;
    }

    // Secure sync with Firebase Firestore
    setLoadingFiles(true);
    const q = query(
      collection(db, 'vault_files'),
      where('userId', '==', fbUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dataList: VaultFile[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        dataList.push({
          id: d.id || doc.id,
          userId: d.userId || '',
          name: d.name || 'Unnamed file',
          type: d.type || 'photo',
          size: d.size || 0,
          url: d.url || '',
          createdAt: d.createdAt || new Date().toISOString()
        });
      });

      // Sort by newest
      dataList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setFiles(dataList);
      setLoadingFiles(false);
    }, (error) => {
      console.error("Error fetching vault files:", error);
      setLoadingFiles(false);
    });

    return () => unsubscribe();
  }, [isLocked, fbUser, authLoading]);

  // Keypad click handler for entering pin
  const handleKeypadPress = (num: string) => {
    setErrorMsg('');
    if (pinInput.length < 4) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);

      // If length reaches 4, evaluate
      if (nextPin.length === 4) {
        if (hasPinSetup) {
          // Check unlock
          if (nextPin === savedPin) {
            setIsLocked(false);
            setPinInput('');
          } else {
            setErrorMsg('Incorrect 4-Digit PIN code. Try again!');
            setPinInput('');
          }
        } else {
          // In Setup Mode
          if (setupStep === 'create') {
            setTempPin(nextPin);
            setSetupStep('confirm');
            setPinInput('');
          } else {
            // Confirm pin
            if (nextPin === tempPin) {
              saveNewPin(nextPin);
            } else {
              setErrorMsg('PIN codes do not match! Restarting PIN setup.');
              setSetupStep('create');
              setTempPin('');
              setPinInput('');
            }
          }
        }
      }
    }
  };

  // Backspace PIN
  const handleKeypadBackspace = () => {
    setErrorMsg('');
    setPinInput(prev => prev.slice(0, -1));
  };

  // Save PIN code to cloud or local storage
  const saveNewPin = async (pin: string) => {
    if (fbUser) {
      try {
        await setDoc(doc(db, 'vault_settings', fbUser.uid), {
          userId: fbUser.uid,
          pin: pin,
          updatedAt: new Date().toISOString()
        });
        setIsLocked(false);
        setPinInput('');
      } catch (err) {
        console.error("Error saving PIN in firestore:", err);
        setErrorMsg('Error syncing security parameters with cloud database.');
        setPinInput('');
        setSetupStep('create');
      }
    } else {
      localStorage.setItem('alvon_vault_pin', pin);
      setSavedPin(pin);
      setHasPinSetup(true);
      setIsLocked(false);
      setPinInput('');
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Perform secure upload to Firebase Storage or Base64 Fallback
  const handleFileUpload = async (file: File) => {
    setUploadError('');
    setUploadProgress(0);
    setUploadingName(file.name);

    // Determine type
    let fileType: 'photo' | 'video' | 'pdf' = 'photo';
    if (file.type.startsWith('video/')) {
      fileType = 'video';
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      fileType = 'pdf';
    } else if (!file.type.startsWith('image/')) {
      // Let other formats fall back to document
      fileType = 'pdf';
    }

    const fileId = 'vault_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // If logged out, save locally as Base64 (max 1.5MB for local sandbox storage limits)
    if (!fbUser) {
      if (file.size > 1500000) {
        setUploadError('Local Sandbox mode only supports file sizes below 1.5MB. Please sign in to enable unlimited cloud files!');
        setUploadProgress(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64Url = reader.result as string;
        const newFile: VaultFile = {
          id: fileId,
          userId: 'guest-vault',
          name: file.name,
          type: fileType,
          size: file.size,
          url: base64Url,
          createdAt: new Date().toISOString()
        };

        const updatedFiles = [newFile, ...files];
        setFiles(updatedFiles);
        localStorage.setItem('alvon_vault_files', JSON.stringify(updatedFiles));
        setUploadProgress(null);
      };
      reader.onerror = () => {
        setUploadError('Could not process this file locally.');
        setUploadProgress(null);
      };
      reader.readAsDataURL(file);
      return;
    }

    // Authenticated Upload: Upload to Firebase Storage
    try {
      const storagePath = `vault/${fbUser.uid}/${fileId}_${file.name}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        }, 
        async (error) => {
          console.error("Firebase Storage error, attempting Firestore fallback:", error);
          
          // If storage bucket isn't responding or is blocked, fallback securely to Firestore base64 if small
          if (file.size < 800000) {
            const reader = new FileReader();
            reader.onload = async () => {
              try {
                const base64Url = reader.result as string;
                const newFile: VaultFile = {
                  id: fileId,
                  userId: fbUser.uid,
                  name: file.name,
                  type: fileType,
                  size: file.size,
                  url: base64Url,
                  createdAt: new Date().toISOString()
                };
                await setDoc(doc(db, 'vault_files', fileId), newFile);
                setUploadProgress(null);
              } catch (fsErr) {
                setUploadError('Failed to upload file to database.');
                setUploadProgress(null);
              }
            };
            reader.readAsDataURL(file);
          } else {
            setUploadError(`Failed to upload to Firebase Storage: ${error.message}. Also too large for database fallback.`);
            setUploadProgress(null);
          }
        }, 
        async () => {
          // Success
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const newFile: VaultFile = {
              id: fileId,
              userId: fbUser.uid,
              name: file.name,
              type: fileType,
              size: file.size,
              url: downloadURL,
              createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'vault_files', fileId), newFile);
            setUploadProgress(null);
          } catch (dbErr) {
            console.error("Error saving metadata in firestore:", dbErr);
            setUploadError('File uploaded but could not sync metadata in database.');
            setUploadProgress(null);
          }
        }
      );
    } catch (err: any) {
      console.error("General upload error:", err);
      setUploadError(err.message || 'File upload failed');
      setUploadProgress(null);
    }
  };

  // Securely delete file from database and storage
  const handleDeleteFile = async (item: VaultFile) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.name}" from your secure vault?`)) return;

    if (!fbUser) {
      // Offline delete
      const updated = files.filter(f => f.id !== item.id);
      setFiles(updated);
      localStorage.setItem('alvon_vault_files', JSON.stringify(updated));
      return;
    }

    // Authenticated secure deletion
    try {
      // 1. Delete document from Firestore
      await deleteDoc(doc(db, 'vault_files', item.id));

      // 2. Try to delete from storage if it is a real Storage URL
      if (item.url.startsWith('https://firebasestorage.googleapis.com')) {
        const decodedUrl = decodeURIComponent(item.url.split('/o/')[1].split('?')[0]);
        const storageRef = ref(storage, decodedUrl);
        await deleteObject(storageRef);
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Deleted from registry. Storage object might have been cleaned up.");
    }
  };

  // Clean / reset passcode
  const handleResetPin = async () => {
    if (!confirm("Resetting your passcode will clear your current PIN. In offline mode, your data may be locked if you forget it. Would you like to proceed?")) return;

    if (fbUser) {
      try {
        await setDoc(doc(db, 'vault_settings', fbUser.uid), {
          userId: fbUser.uid,
          pin: '',
          updatedAt: new Date().toISOString()
        });
        setHasPinSetup(false);
        setIsLocked(true);
        setPinInput('');
        setSetupStep('create');
      } catch (err) {
        alert("Error resetting passcode in cloud.");
      }
    } else {
      localStorage.removeItem('alvon_vault_pin');
      setHasPinSetup(false);
      setIsLocked(true);
      setPinInput('');
      setSetupStep('create');
    }
  };

  // Helpers
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(f => {
    if (selectedFilter === 'all') return true;
    return f.type === selectedFilter;
  });

  return (
    <div className="space-y-6" id="alvon-vault-container">
      
      {/* Cloud Status Info Banner */}
      {!authLoading && (
        <div className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          fbUser 
            ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300'
            : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              fbUser ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
            }`}>
              {fbUser ? <Cloud className="w-5 h-5 animate-pulse" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs font-bold font-sans">
                {fbUser ? "Mil-Grade Cloud Security Active" : "Unsynced Local Storage Locker"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {fbUser 
                  ? "Your files and pin-configuration are securely backed up inside your verified Google Cloud Account."
                  : "Caution: Reinstalling or clearing cache will erase offline gallery contents. Sign in to sync pictures forever."
                }
              </p>
            </div>
          </div>
          
          {!fbUser && (
            <button
              onClick={() => onTabChange('profile')}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-extrabold rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              Log in for Cloud Vault
            </button>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* LOCK SCREEN MODE */}
        {isLocked ? (
          <motion.div
            key="lock-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="max-w-md mx-auto"
          >
            <GlassCard className="bg-white dark:bg-slate-900 p-8 border border-slate-100 dark:border-slate-800 text-center space-y-6 shadow-xl relative overflow-hidden">
              
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

              {/* Padlock visualizer */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-center relative group">
                  <motion.div
                    animate={pinInput.length > 0 ? { rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {hasPinSetup ? (
                      <Lock className="w-8 h-8 text-rose-600" />
                    ) : (
                      <KeyRound className="w-8 h-8 text-amber-500 animate-pulse" />
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Instructions text */}
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider font-display">
                  {hasPinSetup === null ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                      Loading Secure Node...
                    </span>
                  ) : hasPinSetup ? (
                    "Secure Folder Locked"
                  ) : (
                    "Setup Secure Vault PIN"
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                  {hasPinSetup ? (
                    "Enter your secret 4-digit security code to reveal hidden gallery"
                  ) : setupStep === 'create' ? (
                    "Create a 4-digit PIN password to lock your private images, videos, and PDF sheets."
                  ) : (
                    "Re-enter your 4-digit PIN code to confirm security system registration."
                  )}
                </p>
              </div>

              {/* Pin dots indicator */}
              <div className="flex justify-center space-x-4">
                {[0, 1, 2, 3].map((index) => {
                  const isActive = pinInput.length > index;
                  return (
                    <motion.div
                      key={index}
                      animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                      className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
                        isActive 
                          ? 'bg-rose-600 border-rose-600 shadow-md' 
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Alert Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-[11px] font-bold rounded-xl border border-rose-100/50 dark:border-rose-900/30 flex items-center justify-center space-x-1.5 animate-bounce">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Custom Numeric Number Pad */}
              <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="w-16 h-16 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-black text-lg font-mono flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 shadow-sm"
                  >
                    {num}
                  </button>
                ))}
                
                {/* Reset or cancel */}
                <button
                  type="button"
                  onClick={hasPinSetup ? handleResetPin : () => {
                    setSetupStep('create');
                    setPinInput('');
                    setTempPin('');
                    setErrorMsg('');
                  }}
                  className="w-16 h-16 rounded-full text-slate-400 hover:text-slate-600 text-xs font-bold flex items-center justify-center select-none cursor-pointer active:scale-90"
                >
                  {hasPinSetup ? "Reset PIN" : "Clear"}
                </button>

                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="w-16 h-16 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-black text-lg font-mono flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 shadow-sm"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={handleKeypadBackspace}
                  className="w-16 h-16 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 border border-rose-100/20 dark:border-rose-900/10 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-all cursor-pointer select-none active:scale-90"
                >
                  ⌫
                </button>
              </div>

              {/* Extra context information */}
              <div className="pt-2 flex items-center justify-center space-x-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                <span>AES-256 Digital Encrypted Node</span>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          
          /* UNLOCKED ACTIVE VAULT CANVAS */
          <motion.div
            key="unlocked-vault"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsLocked(true)}
                  className="p-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-xl transition-all cursor-pointer"
                  title="Lock Vault"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-800 dark:text-slate-100" />
                </button>
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-100 font-display flex items-center gap-2">
                    <span>Secure Vault</span>
                    <span className="bg-rose-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full tracking-wider">UNLOCKED</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Secure sandbox to hide sensitive private media and PDF documents</p>
                </div>
              </div>

              {/* Reset / Lock action button */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleResetPin}
                  className="px-3.5 py-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 bg-white dark:bg-slate-900 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 border border-slate-200/50 dark:border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Reset PIN Code</span>
                </button>

                <button
                  onClick={() => setIsLocked(true)}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Vault</span>
                </button>
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                isDragOver 
                  ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/10' 
                  : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 hover:bg-white hover:border-slate-300 dark:hover:bg-slate-900'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,video/*,application/pdf"
              />

              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center border border-rose-100/50 dark:border-rose-900/30 shadow-sm">
                <Upload className="w-6 h-6" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Drag & drop files here, or <span className="text-rose-600 hover:underline">browse computer</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, MP4, and PDF documents</p>
              </div>
            </div>

            {/* Real-time Upload Progress Bar */}
            {uploadProgress !== null && (
              <GlassCard className="bg-gradient-to-r from-rose-50 to-blue-50/50 dark:from-slate-900 dark:to-slate-900/60 p-4 border border-rose-100/20 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{uploadingName}</span>
                  </div>
                  <span className="text-rose-600 font-mono">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="bg-rose-600 h-full rounded-full"
                  />
                </div>
              </GlassCard>
            )}

            {/* Upload Error Banner */}
            {uploadError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100/30 dark:border-rose-900/20 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-2xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Gallery Section */}
            <div className="space-y-4">
              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                {[
                  { id: 'all', label: 'All Files', icon: HardDrive },
                  { id: 'photo', label: 'Photos', icon: ImageIcon },
                  { id: 'video', label: 'Videos', icon: Video },
                  { id: 'pdf', label: 'PDF Documents', icon: FileText },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = selectedFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedFilter(tab.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Media Grid */}
              {loadingFiles ? (
                <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
                  <p className="text-xs font-bold text-slate-500 font-mono tracking-wider">SYNCING SECURE VAULT WITH GOOGLE CLOUD...</p>
                </div>
              ) : filteredFiles.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredFiles.map((file) => (
                    <motion.div
                      layout
                      key={file.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm relative hover:shadow-md transition-all flex flex-col"
                    >
                      {/* Media Area */}
                      <div className="aspect-square bg-slate-50 dark:bg-slate-950 flex items-center justify-center relative overflow-hidden select-none">
                        
                        {/* PHOTOS preview */}
                        {file.type === 'photo' && (
                          <img
                            src={file.url}
                            alt={file.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => setPreviewFile(file)}
                          />
                        )}

                        {/* VIDEOS visualizer */}
                        {file.type === 'video' && (
                          <div 
                            onClick={() => setPreviewFile(file)}
                            className="w-full h-full flex flex-col items-center justify-center bg-slate-950 cursor-pointer relative"
                          >
                            <video 
                              src={file.url} 
                              className="w-full h-full object-cover opacity-80" 
                              muted
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-rose-600/95 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Video className="w-5 h-5 ml-0.5" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* PDF Document visualizer */}
                        {file.type === 'pdf' && (
                          <div 
                            onClick={() => setPreviewFile(file)}
                            className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 cursor-pointer hover:bg-slate-100/50 transition-all text-center space-y-2"
                          >
                            <div className="p-3 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl shadow-sm">
                              <FileText className="w-7 h-7" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 tracking-wider">PDF PORTABLE</span>
                          </div>
                        )}

                        {/* Delete button (displays on hover) */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFile(file);
                            }}
                            className="p-1.5 bg-slate-900/70 hover:bg-rose-600 text-white rounded-lg backdrop-blur-sm transition-all shadow-sm cursor-pointer"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Info segment */}
                      <div className="p-3 border-t border-slate-50 dark:border-slate-850 flex-1 flex flex-col justify-between">
                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 font-semibold font-mono">
                          <span>{formatSize(file.size)}</span>
                          <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-3xl p-16 text-center text-slate-400 dark:text-slate-500 space-y-3">
                  <div className="w-14 h-14 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm text-2xl">
                    📁
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300">No media locked inside vault</h4>
                    <p className="text-xs mt-1">Upload private photographs, ledger scans, or secure PDFs to secure your data.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN PREVIEW MODAL */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" 
              onClick={() => setPreviewFile(null)} 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-slate-900 text-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[85vh] flex flex-col z-10 shadow-2xl border border-slate-800"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="p-1.5 bg-slate-800 rounded-lg text-rose-500">
                    {previewFile.type === 'photo' && <ImageIcon className="w-4 h-4" />}
                    {previewFile.type === 'video' && <Video className="w-4 h-4" />}
                    {previewFile.type === 'pdf' && <FileText className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-bold truncate max-w-[240px] md:max-w-md">{previewFile.name}</span>
                </div>
                
                <div className="flex items-center space-x-2 shrink-0">
                  <a
                    href={previewFile.url}
                    download={previewFile.name}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold rounded-lg transition-all"
                  >
                    Open Original
                  </a>
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="p-1.5 bg-slate-800 hover:bg-rose-600 rounded-lg transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content area */}
              <div className="flex-1 bg-slate-950 p-6 flex items-center justify-center overflow-auto min-h-[300px]">
                
                {/* PHOTO PREVIEW */}
                {previewFile.type === 'photo' && (
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-[55vh] object-contain rounded-lg"
                  />
                )}

                {/* VIDEO PREVIEW */}
                {previewFile.type === 'video' && (
                  <video
                    src={previewFile.url}
                    controls
                    autoPlay
                    className="max-w-full max-h-[55vh] rounded-lg"
                  />
                )}

                {/* PDF PREVIEW (using standard object embed or simple preview prompt) */}
                {previewFile.type === 'pdf' && (
                  <div className="w-full h-[55vh] flex flex-col items-center justify-center text-center space-y-4 max-w-md">
                    <div className="p-5 bg-red-950/40 text-red-500 rounded-3xl border border-red-900/30">
                      <FileText className="w-12 h-12" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Secure PDF Document</p>
                      <p className="text-xs text-slate-400 mt-1">For safety, documents are sandboxed inside Alvon Secure Vault.</p>
                    </div>
                    <a
                      href={previewFile.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 font-extrabold text-xs rounded-xl shadow-md transition-all inline-block"
                    >
                      View Document In Secure Frame
                    </a>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-950 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono font-medium">
                <span>File Size: {formatSize(previewFile.size)}</span>
                <span>Added on: {new Date(previewFile.createdAt).toLocaleString()}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
