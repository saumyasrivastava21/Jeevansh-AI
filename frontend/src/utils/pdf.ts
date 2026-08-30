import { BASE_URL } from '@/lib/api';

interface ToastHelper {
  toast: (props: { title: string; description?: string; variant?: 'default' | 'success' | 'destructive' | 'info' | 'warning' }) => void;
}

export const downloadReportPdf = async (reportId: string, toast: ToastHelper['toast']) => {
  const token = localStorage.getItem('jeevansh_token');
  if (!token) {
    toast({
      title: 'Authentication Required',
      description: 'Please sign in to download this report.',
      variant: 'destructive',
    });
    return;
  }

  toast({
    title: 'Preparing Download',
    description: 'Your medical report PDF is being prepared...',
    variant: 'info',
  });

  try {
    const response = await fetch(`${BASE_URL}/reports/${reportId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // Returned json means there is an error or it's still generating
        const errData = await response.json();
        if (errData.status === 'generating' || errData.status === 'pending') {
          toast({
            title: 'Report Preparing',
            description: 'Your medical report PDF is still being generated. Please wait.',
            variant: 'warning',
          });
        } else {
          toast({
            title: 'Download Failed',
            description: errData.message || 'Unable to download the report. Please try again.',
            variant: 'destructive',
          });
        }
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Jeevansh-AI-Report-${reportId.slice(-6).toUpperCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Report downloaded successfully.',
        variant: 'success',
      });
    } else if (response.status === 401 || response.status === 403) {
      toast({
        title: 'Access Denied',
        description: 'Your session has expired. Please sign in again.',
        variant: 'destructive',
      });
    } else if (response.status === 404) {
      toast({
        title: 'Report Not Found',
        description: 'The requested medical report could not be found.',
        variant: 'destructive',
      });
    } else {
      // 500, 502, etc.
      toast({
        title: 'Server Error',
        description: 'Unable to download the report. Please try again.',
        variant: 'destructive',
      });
    }
  } catch (error) {
    console.error('PDF download failed:', error);
    toast({
      title: 'Network Error',
      description: 'Unable to connect to the server. Please check your connection.',
      variant: 'destructive',
    });
  }
};
