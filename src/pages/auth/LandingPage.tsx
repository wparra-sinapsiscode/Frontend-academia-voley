import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../contexts/AppContext';
import { FiEye, FiEyeOff, FiMail, FiLock, FiAward, FiUsers, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

const schema = yup.object({
  email: yup.string().email('Email inválido').required('Email es requerido'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('Contraseña es requerida'),
});

interface FormData {
  email: string;
  password: string;
}

const LandingPage: React.FC = () => {
  const { login, students, tournaments } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  const testimonials = [
    {
      name: "María García",
      role: "Madre de Valentina",
      content: "Mi hija ha crecido mucho técnica y personalmente. El ambiente es excepcional.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b4e4e8?w=150"
    },
    {
      name: "Luis Mendoza",
      role: "Padre de Sofía",
      content: "Las entrenadoras son profesionales increíbles. Recomiendo totalmente la academia.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
      name: "Carmen Torres",
      role: "Madre de Isabella",
      content: "El seguimiento personalizado y la comunicación constante nos tranquilizan mucho.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
    }
  ];

  const champions = [
    { name: "Valentina López", category: "Sub-12", achievement: "Campeona Copa Primavera", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150" },
    { name: "Sofía Mendoza", category: "Sub-12", achievement: "Mejor Técnica 2024", image: "https://images.unsplash.com/photo-1494790108755-2616b4e4e8?w=150" },
    { name: "Isabella García", category: "Sub-12", achievement: "Mejor Compañera", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" }
  ];

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast.success('¡Bienvenida! Sesión iniciada correctamente');
      } else {
        toast.error('Credenciales incorrectas. Inténtalo nuevamente.');
      }
    } catch (error) {
      toast.error('Error al iniciar sesión. Inténtalo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-300 to-primary-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAward className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Academia de Vóley</h1>
            <p className="text-gray-600 mt-2">Lima, Perú - Formando campeonas</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className={`input-field pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-400 focus:ring-primary-300"
                />
                <span className="ml-2 text-sm text-gray-600">Recordarme</span>
              </label>
              <a href="#" className="text-sm text-primary-400 hover:text-primary-500">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full btn-primary ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900 mb-2">Credenciales de demo:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Admin:</strong> admin@academiavoley.pe / admin123</p>
              <p><strong>Entrenadora:</strong> sofia.martinez@academiavoley.pe / coach123</p>
              <p><strong>Padre:</strong> lucia.garcia@email.com / parent123</p>
              <p className="text-gray-500 italic">* Los padres manejan las cuentas de sus hijas</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Showcase */}
      <div className="hidden lg:flex lg:flex-1 relative">
        {/* Background Video/Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400/90 to-secondary-900/90" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Hero Section */}
            <div className="mb-12">
              <h2 className="text-4xl font-bold mb-4">
                Formamos las <span className="text-yellow-300">campeonas</span> del futuro
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Una academia donde cada niña desarrolla su potencial deportivo y personal 
                en un ambiente de excelencia y valores.
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-yellow-300">{students.length}+</div>
                <div className="text-sm text-blue-100">Estudiantes Activas</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-yellow-300">{tournaments.length}</div>
                <div className="text-sm text-blue-100">Torneos Realizados</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-yellow-300">95%</div>
                <div className="text-sm text-blue-100">Satisfacción Padres</div>
              </motion.div>
            </div>

            {/* Testimonials Carousel */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <FiStar className="text-yellow-300" />
                Lo que dicen nuestros padres
              </h3>
              <div className="relative">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="glass-effect rounded-xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={testimonials[currentTestimonial].avatar}
                      alt={testimonials[currentTestimonial].name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-blue-100 mb-3 italic">
                        "{testimonials[currentTestimonial].content}"
                      </p>
                      <div>
                        <p className="font-semibold">{testimonials[currentTestimonial].name}</p>
                        <p className="text-sm text-blue-200">{testimonials[currentTestimonial].role}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
                <div className="flex justify-between mt-4">
                  <button onClick={prevTestimonial} className="p-2 hover:bg-white/10 rounded-full">
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex gap-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTestimonial(index)}
                        className={`w-2 h-2 rounded-full ${
                          currentTestimonial === index ? 'bg-white' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                  <button onClick={nextTestimonial} className="p-2 hover:bg-white/10 rounded-full">
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Champions Gallery */}
            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <FiAward className="text-yellow-300" />
                Nuestras Campeonas
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {champions.map((champion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    className="glass-effect rounded-lg p-4 text-center"
                  >
                    <img
                      src={champion.image}
                      alt={champion.name}
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-3"
                    />
                    <h4 className="font-semibold text-sm">{champion.name}</h4>
                    <p className="text-xs text-blue-200">{champion.category}</p>
                    <p className="text-xs text-yellow-300 mt-1">{champion.achievement}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-12 text-center">
              <p className="text-blue-100 mb-2">¿Interesada en unirte?</p>
              <p className="font-semibold">📞 +51 987 654 321</p>
              <p className="text-sm text-blue-200">Lima, Perú - Av. Principal 123, Miraflores</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;