import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Feather } from 'lucide-react';
import { useAuth } from '../contexts/auth';
import { AuthService } from '../api/services';
import styles from './Auth.module.css';

type ApiErrorResponse = {
  detail?: string;
};

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await AuthService.register({ email, password, display_name: displayName });
      
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      
      const res = await AuthService.login(params);
      await login(res.access_token);
      
      navigate('/');
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      setError(error.response?.data?.detail || 'Failed to register');
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        
        <div className={styles.header}>
          <div className={styles.brand}>
            <Feather size={32} strokeWidth={1.5} />
          </div>
          <h1 className={styles.title}>Create Your Private Account</h1>
          <p className={styles.subtitle}>
            Build stories, characters, relationships, and discoveries in your own private creative workspace.
          </p>
        </div>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              required
              className={styles.input}
              placeholder="How should we call you?"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              required
              className={styles.input}
              placeholder="writer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              className={styles.input}
              placeholder="Enter a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.button}>
            Create Your Private Account
          </button>
          
          <div className={styles.footer}>
            Already have an account?
            <Link to="/login" className={styles.link}>
              Enter Story Architect
            </Link>
          </div>
        </form>
        
      </div>
    </div>
  );
}
