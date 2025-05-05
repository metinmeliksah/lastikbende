'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import { Container, Typography, Button, Box, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { saveContractAcceptance } from '../../../services/api';

const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const ContractSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

export default function MembershipAgreement() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [language, setLanguage] = useState('tr');
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    // Set initial language
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(t('membershipAgreement.title'), 20, 20);
    doc.text(t('membershipAgreement.version'), 20, 30);
    doc.text(t('membershipAgreement.effectiveDate'), 20, 40);
    doc.text(t('membershipAgreement.content'), 20, 50);
    doc.save('membership-agreement.pdf');
  };

  const handleAcceptContract = async () => {
    if (user) {
      try {
        await saveContractAcceptance({
          userId: user.id,
          contractType: 'membership',
          acceptedAt: new Date(),
        });
        router.push('/dashboard');
      } catch (error) {
        console.error('Error saving contract acceptance:', error);
      }
    }
  };

  return (
    <StyledContainer maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          {t('membershipAgreement.title')}
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="language-select-label">{t('common.language')}</InputLabel>
          <Select
            labelId="language-select-label"
            value={language}
            label={t('common.language')}
            onChange={handleLanguageChange}
          >
            <MenuItem value="tr">Türkçe</MenuItem>
            <MenuItem value="en">English</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" color="text.secondary">
          {t('membershipAgreement.version')} v1.2
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {t('membershipAgreement.effectiveDate')} 01.05.2025
        </Typography>
      </Box>

      <ContractSection>
        <Typography variant="h5" component="h2" gutterBottom>
          {t('membershipAgreement.section1.title')}
        </Typography>
        <Typography paragraph>
          {t('membershipAgreement.section1.content')}
        </Typography>
      </ContractSection>

      <ContractSection>
        <Typography variant="h5" component="h2" gutterBottom>
          {t('membershipAgreement.section2.title')}
        </Typography>
        <Typography paragraph>
          {t('membershipAgreement.section2.content')}
        </Typography>
      </ContractSection>

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownloadPDF}
          aria-label={t('common.downloadPDF')}
        >
          {t('common.downloadPDF')}
        </Button>
        {user && (
          <Button
            variant="contained"
            color="success"
            onClick={handleAcceptContract}
            aria-label={t('common.acceptContract')}
          >
            {t('common.acceptContract')}
          </Button>
        )}
      </Box>

      <Box sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => window.location.href = 'mailto:support@lastikbende.com'}
          aria-label={t('common.contactSupport')}
        >
          {t('common.contactSupport')}
        </Button>
      </Box>
    </StyledContainer>
  );
} 