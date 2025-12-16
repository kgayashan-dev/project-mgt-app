"use client";
import React, { useState, useEffect } from "react";
import TeamMembers from "./TeamMembers";

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

export default function TeamMembersPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API Base URL
  const API_BASE_URL = "http://localhost:5132/project_pulse/TeamMembers";

  // Function to fetch all team members
  const fetchAllTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/getAllTeamMembers`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setTeamMembers(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch team members");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching team members:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh data
  const refreshTeamMembers = () => {
    fetchAllTeamMembers();
  };

  // Fetch team members on component mount
  useEffect(() => {
    fetchAllTeamMembers();
  }, []);

  // Prepare data to pass as props
  const teamMembersData = {
    members: teamMembers,
    loading: loading,
    error: error,
    onRefresh: refreshTeamMembers
  };

  return (
    <div>
      <TeamMembers {...teamMembersData} />
    </div>
  );
}