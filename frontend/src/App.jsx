import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookProvider } from './context/BookContext';
import { NotificationProvider } from './context/NotificationContext';
import { router } from './routes';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BookProvider>
          <RouterProvider router={router} />
        </BookProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
