import React, { useState } from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import { useAuth } from '../context/AuthContext';
import styles from './auth.module.css';

const SOFTWARE_LEVELS = [
  { value: 'beginner', label: 'Beginner', desc: 'Just starting out with programming' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Comfortable with at least one language' },
  { value: 'advanced', label: 'Advanced', desc: 'Professional developer or CS student' },
];

const HARDWARE_LEVELS = [
  { value: 'none', label: 'None', desc: "Never touched hardware" },
  { value: 'hobbyist', label: 'Hobbyist', desc: 'Arduino/Raspberry Pi projects' },
  { value: 'professional', label: 'Professional', desc: 'EE background or robotics experience' },
];

const ROBOTICS_EXPERIENCE = [
  { value: 'none', label: 'None', desc: 'Complete newcomer to robotics' },
  { value: 'theoretical', label: 'Theoretical', desc: 'Read about it, never built one' },
  { value: 'hobbyist', label: 'Hobbyist', desc: 'Built simple robots or drones' },
  { value: 'professional', label: 'Professional', desc: 'Work in robotics industry' },
];

export default function SignupPage() {
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    softwareLevel: 'beginner',
    hardwareLevel: 'none',
    programmingLanguages: '',
    roboticsExperience: 'none',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        software_level: formData.softwareLevel,
        hardware_level: formData.hardwareLevel,
        programming_languages: formData.programmingLanguages,
        robotics_experience: formData.roboticsExperience,
      });

      if (!result.success) {
        setError(result.error || 'Signup failed');
      } else {
        window.location.href = '/docs';
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <Head>
        <title>Sign Up | Physical AI</title>
      </Head>

      <div className={styles.authContainer}>
        <div className={styles.authHeader}>
          <Link to="/" className={styles.logo}>Physical AI</Link>
          <h1>Create Account</h1>
          <p>Tell us about yourself so we can personalize your learning</p>
        </div>

        <div className={styles.progressBar}>
          <div className={styles.progressStep} data-active={step >= 1}>1</div>
          <div className={styles.progressLine} data-active={step >= 2} />
          <div className={styles.progressStep} data-active={step >= 2}>2</div>
          <div className={styles.progressLine} data-active={step >= 3} />
          <div className={styles.progressStep} data-active={step >= 3}>3</div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className={styles.stepContent}>
              <h2>Account Details</h2>
              
              <div className={styles.inputGroup}>
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className={styles.showPasswordBtn}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button 
                type="button" 
                className={styles.primaryBtn}
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContent}>
              <h2>Your Background</h2>

              <div className={styles.optionGroup}>
                <label>Software Experience</label>
                {SOFTWARE_LEVELS.map(level => (
                  <div 
                    key={level.value}
                    className={styles.optionCard}
                    data-selected={formData.softwareLevel === level.value}
                    onClick={() => handleChange('softwareLevel', level.value)}
                  >
                    <strong>{level.label}</strong>
                    <span>{level.desc}</span>
                  </div>
                ))}
              </div>

              <div className={styles.optionGroup}>
                <label>Hardware Experience</label>
                {HARDWARE_LEVELS.map(level => (
                  <div 
                    key={level.value}
                    className={styles.optionCard}
                    data-selected={formData.hardwareLevel === level.value}
                    onClick={() => handleChange('hardwareLevel', level.value)}
                  >
                    <strong>{level.label}</strong>
                    <span>{level.desc}</span>
                  </div>
                ))}
              </div>

              <div className={styles.buttonRow}>
                <button 
                  type="button" 
                  className={styles.secondaryBtn}
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button 
                  type="button" 
                  className={styles.primaryBtn}
                  onClick={() => setStep(3)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepContent}>
              <h2>Robotics Experience</h2>

              <div className={styles.optionGroup}>
                <label>Prior Robotics Experience</label>
                {ROBOTICS_EXPERIENCE.map(level => (
                  <div 
                    key={level.value}
                    className={styles.optionCard}
                    data-selected={formData.roboticsExperience === level.value}
                    onClick={() => handleChange('roboticsExperience', level.value)}
                  >
                    <strong>{level.label}</strong>
                    <span>{level.desc}</span>
                  </div>
                ))}
              </div>

              <div className={styles.inputGroup}>
                <label>Programming Languages (optional)</label>
                <input
                  type="text"
                  value={formData.programmingLanguages}
                  onChange={(e) => handleChange('programmingLanguages', e.target.value)}
                  placeholder="e.g., Python, C++, JavaScript"
                />
              </div>

              <div className={styles.buttonRow}>
                <button 
                  type="button" 
                  className={styles.secondaryBtn}
                  onClick={() => setStep(2)}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className={styles.primaryBtn}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className={styles.authFooter}>
          Already have an account? <Link to="/signin">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
