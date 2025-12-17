"use client";
import React, { useState, useEffect } from "react";
import TeamMembers from "./TeamMembers";
import { getAllTeamMembers } from "@/utils/getdata";

interface TeamMember {
  memId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  joinDate: string;
  isActive: boolean;
  createdDate: string;
}

// This is a Client Component
export default function TeamMembersPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const teamMembersResponse = await getAllTeamMembers();
        
        console.log("Team members response:", teamMembersResponse);
        
        // Handle different response structures
        if (teamMembersResponse.success) {
          setTeamMembers(teamMembersResponse.data || []);
        } else if (Array.isArray(teamMembersResponse)) {
          setTeamMembers(teamMembersResponse);
        } else {
          throw new Error("Unexpected response structure");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch team members";
        setError(errorMessage);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const teamMembersResponse = await getAllTeamMembers();
      
      if (teamMembersResponse.success) {
        setTeamMembers(teamMembersResponse.data || []);
      } else if (Array.isArray(teamMembersResponse)) {
        setTeamMembers(teamMembersResponse);
      } else {
        throw new Error("Unexpected response structure");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh data";
      setError(errorMessage);
      console.error("Error refreshing data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TeamMembers 
        teamMembersData={teamMembers}
        loading={loading}
        error={error}
        onRefresh={handleRefresh}
      />
    </div>
  );
}