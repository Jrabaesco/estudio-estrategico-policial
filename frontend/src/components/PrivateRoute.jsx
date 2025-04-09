import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';

const PrivateRoute = ({ children }) => {
  const user = getCurrentUser();
  return user ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;