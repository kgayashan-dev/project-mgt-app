"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadAccessData } from '@/utils/loadnavdata';

interface PermissionContextType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  permissions: any[];
  hasPermission: (permissionId: number) => boolean;
  loading: boolean;
}

const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  hasPermission: () => false,
  loading: true,
});

export const usePermissions = () => useContext(PermissionContext);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        // Check localStorage first for cached permissions
        const cached = localStorage.getItem('userPermissions');
        if (cached) {
          setPermissions(JSON.parse(cached));
        }

        // Always refresh from server in background
        const freshPermissions = await loadAccessData();
        const permissionArray = Array.isArray(freshPermissions) 
          ? freshPermissions 
          : freshPermissions?.data || [];
        
        setPermissions(permissionArray);
        localStorage.setItem('userPermissions', JSON.stringify(permissionArray));
      } catch (error) {
        console.error('Failed to load permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, []);

  const hasPermission = (permissionId: number) => {
    return permissions.some(perm => perm.id === permissionId);
  };

  return (
    <PermissionContext.Provider value={{ permissions, hasPermission, loading }}>
      {children}
    </PermissionContext.Provider>
  );
};