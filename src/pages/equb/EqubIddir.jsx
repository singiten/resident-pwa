import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, CircularProgress, Tabs, Tab } from '@mui/material';
import SavingsIcon from '@mui/icons-material/Savings';
import PeopleIcon from '@mui/icons-material/People';
import EmptyState from '../../components/common/EmptyState';
import { api } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const EqubIddir = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('equb');
  const [equbs, setEqubs] = useState([]);
  const [iddirs, setIddirs] = useState([]);

    useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const isSuperAdmin = user.role === 'super_admin';

        if (activeTab === 'equb') {
          // Super Admin fetches all equbs, Resident fetches public equbs for their condo
          const res = isSuperAdmin 
            ? await api.equbs.getAll() // Make sure your axiosConfig has this
            : await api.equbs.getPublic(user?.condoId, { limit: 20 });
            
          const data = res.data.data;
          const items = data?.items || data || [];
          setEqubs(items);
        } else {
          // Iddirs
          const res = isSuperAdmin
            ? await api.iddirs.getAll() 
            : await api.iddirs.getAll(user?.condoId);
          const data = res.data.data;
          const items = data?.items || data || [];
          setIddirs(items);
        }
      } catch (err) {
        console.error(err);
        toast.error(`Failed to load ${activeTab}s`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, user]);

  const currentList = activeTab === 'equb' ? equbs : iddirs;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f8f9fa' }}>
      <Box sx={{ p: 2, pb: 0, bgcolor: '#fff', borderBottom: '1px solid #eef0f3' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#1a1a2e' }}>
          {user.role === 'super_admin' ? 'System Groups' : 'Community Groups'}
        </Typography>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="fullWidth"
          sx={{ '& .MuiTabs-indicator': { backgroundColor: '#D3AD32', height: 3 } }}
        >
          <Tab label="Equbs" value="equb" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Iddirs" value="iddir" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#D3AD32' }} /></Box>
        ) : currentList.length === 0 ? (
          <EmptyState icon={activeTab === 'equb' ? SavingsIcon : PeopleIcon} title={`No ${activeTab}s`} message="No groups found." />
        ) : (
          currentList.map((group) => (
            <Paper key={group.id} elevation={0} sx={{ p: 2, mb: 2, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{group.name}</Typography>
                <Chip label={group.status} size="small" sx={{ fontWeight: 700 }} />
              </Box>
              <Typography variant="body2" sx={{ color: '#6b7a8f', mb: 1 }}>
                Contribution: <strong>ETB {group.contributionAmount?.toLocaleString()}</strong>
              </Typography>
              {user.role === 'super_admin' && (
                <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                  Condo ID: {group.condoId?.slice(0, 8)}...
                </Typography>
              )}
            </Paper>
          ))
        )}
      </Box>
    </Box>
  );
};

export default EqubIddir;