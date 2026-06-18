import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Feather } from 'lucide-react';
import { useAuth } from '../contexts/auth';
import { AuthService } from '../api/services';
import styles from './Auth.module.css';

type ApiErrorResponse = {
  detail?: string;
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      
      const res = await AuthService.login(params);
      await login(res.access_token);
      
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      setError(error.response?.data?.detail || 'Failed to login');
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        
        <div className={styles.header}>
          <div className={styles.brand}>
            <Feather size={32} strokeWidth={1.5} />
          </div>
          <h1 className={styles.title}>Enter Story Architect</h1>
          <p className={styles.subtitle}>
            Return to your stories, characters, relationships, and discoveries. Everything remains private to your account.
          </p>
        </div>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}
          
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.button}>
            Enter Story Architect
          </button>
          
          <div className={styles.footer}>
            New here? 
            <Link to="/register" className={styles.link}>
              Create Your Private Account
            </Link>
          </div>
        </form>
        
      </div>
    </div>
  );
}
