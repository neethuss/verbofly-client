// import {create} from 'zustand';
// import { devtools, persist } from 'zustand/middleware';

// interface AuthState {
//   user: any | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   setUserAuth: (user: any) => void;
//   setUser: (user: any) => void;
//   logout: () => void;
//   initAuth: () => void;
// }

// const useAuthStore = create<AuthState>()(

  
//   devtools(
//     persist(
//       (set) => ({
//         user: null,
//         isAuthenticated: false,
//         isLoading: true,
//         setUserAuth: (user) => {
//           localStorage.setItem('user', JSON.stringify(user));
//           localStorage.setItem('userAccessToken', user.accessToken);
//           set({ user, isAuthenticated: true, isLoading: false });
//         },
//         setUser: (user) => {
//           set({ user });
//         },
//         logout: () => {
//           localStorage.removeItem('user');
//           localStorage.removeItem('userAccessToken');
//           set({ user: null, isAuthenticated: false, isLoading: false });
          
//         },
//         initAuth: () => {
//           const user = JSON.parse(localStorage.getItem('user') || 'null');
//           const token = localStorage.getItem('userAccessToken');
//           if (user && token) {
//             set({ user, isAuthenticated: true, isLoading: false });
//           } else {
//             set({ user: null, isAuthenticated: false, isLoading: false });
//           }
//         },
//       }),
//       {
//         name: 'auth-storage',
//       }
//     ),
//     { name: "AuthStore" }
//   )
// );

// export default useAuthStore;


import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUserAuth: (admin: any) => void;
  setUser: (admin: any) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        setUserAuth: (user) => {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('userAccessToken', user.accessToken);
          set({ user, isAuthenticated: true, isLoading: false });
        },
        setUser: (user) => {
          set({ user });
        },
        logout: () => {
          localStorage.removeItem('user');
          localStorage.removeItem('userAccessToken');
          set({ user: null, isAuthenticated: false, isLoading: false });
        },
        initAuth: async () => {
          const user = JSON.parse(localStorage.getItem('user') || 'null');
          const token = localStorage.getItem('userAccessToken');
          if (user && token) {
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        },
      }),
      {
        name: 'auth-storage',
      }
    ),
    { name: "AuthStore" }
  )
);

export default useAuthStore;