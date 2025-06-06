import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiUser, FiLock, FiCamera, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useAppContext } from '../../contexts/AppContext';
import { processImageFile, validateImageFile } from '../../utils/imageUtils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, users, dispatch } = useAppContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Image upload state
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || ''
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<any>({});

  // Image handling functions
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📸 Imagen seleccionada:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeKB: (file.size / 1024).toFixed(2) + ' KB'
    });

    // Validate image
    const validation = validateImageFile(file);
    if (!validation.valid) {
      console.error('❌ Validación falló:', validation.error);
      setImageError(validation.error || 'Error al validar la imagen');
      return;
    }

    console.log('✅ Imagen válida');
    setImageError(null);
    setSelectedImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      console.log('👁️ Preview creado:', result.substring(0, 100) + '...');
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const clearSelectedImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetImageError = () => {
    setImageError(null);
  };

  if (!isOpen || !user) return null;
  
  // Log inicial cuando se abre el modal
  console.log('🔧 Settings Modal abierto:', {
    usuario: user.name,
    email: user.email,
    tieneProfileImage: !!user.profileImage,
    profileImageLength: user.profileImage?.length,
    camposUsuario: Object.keys(user)
  });

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);
    resetImageError();

    // Validations
    const newErrors: any = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!validateEmail(profileData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Check if email is already taken by another user
    const emailExists = users.some(u => u.email === profileData.email && u.id !== user.id);
    if (emailExists) {
      newErrors.email = 'Este email ya está en uso';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      const updatedProfileData = { ...profileData };
      
      // Process image if selected
      if (selectedImageFile) {
        try {
          console.log('🖼️ Procesando imagen:', selectedImageFile.name);
          const processedImage = await processImageFile(selectedImageFile);
          updatedProfileData.profileImage = processedImage.base64;
          console.log('✅ Imagen procesada:', {
            fileName: processedImage.fileName,
            fileSize: processedImage.fileSize,
            originalSize: processedImage.originalSize,
            compressed: processedImage.compressed,
            base64Preview: processedImage.base64.substring(0, 100) + '...'
          });
        } catch (error) {
          console.error('❌ Error al procesar imagen:', error);
          setMessage({ type: 'error', text: 'Error al procesar la imagen' });
          setLoading(false);
          return;
        }
      }
      
      console.log('📝 Datos a guardar:', {
        id: user.id,
        name: updatedProfileData.name,
        email: updatedProfileData.email,
        phone: updatedProfileData.phone,
        hasProfileImage: !!updatedProfileData.profileImage,
        profileImageLength: updatedProfileData.profileImage?.length
      });
      
      // Update user in context (this will update both users array and current user)
      dispatch({
        type: 'UPDATE_USER',
        payload: {
          id: user.id,
          user: updatedProfileData
        }
      });
      console.log('✅ Dispatch UPDATE_USER enviado');
      
      // Update profileData state with new avatar
      setProfileData(updatedProfileData);
      
      // Update in localStorage
      const updatedUser = { ...user, ...updatedProfileData };
      console.log('💾 Guardando en localStorage:', {
        ...updatedUser,
        profileImage: updatedUser.profileImage ? updatedUser.profileImage.substring(0, 100) + '...' : null
      });
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Verificar que se guardó correctamente
      const savedUser = localStorage.getItem('currentUser');
      const parsedSaved = savedUser ? JSON.parse(savedUser) : null;
      console.log('✅ Verificación localStorage:', {
        guardadoCorrectamente: !!savedUser,
        tieneProfileImage: !!parsedSaved?.profileImage,
        profileImageLength: parsedSaved?.profileImage?.length
      });
      
      // Clear selected image
      clearSelectedImage();
      
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);

    // Validations
    const newErrors: any = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    } else if (user.password && passwordData.currentPassword !== user.password) {
      newErrors.currentPassword = 'Contraseña incorrecta';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      // Update user password (this will update both users array and current user)
      dispatch({
        type: 'UPDATE_USER',
        payload: {
          id: user.id,
          user: {
            password: passwordData.newPassword
          }
        }
      });
      
      // Update in localStorage
      const updatedUser = { ...user, password: passwordData.newPassword };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar la contraseña' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Configuración de Usuario
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FiUser className="inline-block w-4 h-4 mr-2" />
            Información Personal
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <FiLock className="inline-block w-4 h-4 mr-2" />
            Cambiar Contraseña
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}
            >
              {message.type === 'success' ? (
                <FiCheck className="w-5 h-5" />
              ) : (
                <FiAlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm">{message.text}</span>
            </motion.div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={imagePreview || profileData.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
                    alt={profileData.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                    title="Cambiar foto de perfil"
                  >
                    <FiCamera className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {profileData.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mb-2">
                    {user.role === 'admin' ? 'Administrador' : user.role}
                  </p>
                  {imageError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{imageError}</p>
                  )}
                  {selectedImageFile && (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-green-600 dark:text-green-400">Imagen seleccionada</p>
                      <button
                        type="button"
                        onClick={clearSelectedImage}
                        className="text-sm text-red-600 dark:text-red-400 hover:underline"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="+51 999 999 999"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.currentPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Actualizando...' : 'Cambiar contraseña'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;