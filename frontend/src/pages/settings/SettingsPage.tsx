import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import SectionLoader from '../../components/ui/SectionLoader';
import ConfigService, { Configuration } from '../../services/configuration.service';
import { Button } from '../../components/ui/Button';

const Container = styled.div`
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--spacing-lg);
`;

const Tab = styled.button<{ active: boolean }>`
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  border-bottom: 3px solid;
  border-color: ${props => props.active ? 'var(--color-primary)' : 'transparent'};
  color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-text-secondary)'};
  cursor: pointer;
  font-weight: ${props => props.active ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)'};
  &:hover { color: var(--color-primary); }
`;

const Section = styled.div`
  background-color: var(--color-white);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);

  /* Inputs and labels styling */
  label {
    display: block;
    margin-top: var(--spacing-md);
    margin-bottom: var(--spacing-xs);
    color: var(--color-text);
  }
  input[type='text'],
  input[type='number'],
  input[type='date'],
  input[type='password'],
  input[type='checkbox'] {
    width: 100%;
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    border: 1px solid black;
    border-radius: var(--border-radius-sm);
    background-color: var(--color-white);
    color: var(--color-text);
    box-sizing: border-box;
  }
  /* Dark mode */
  html[data-theme='dark'] & {
    background-color: var(--color-bg-secondary);
    label {
      color: var(--color-text);
    }
    input[type='text'],
    input[type='number'],
    input[type='date'],
    input[type='password'],
    input[type='checkbox'] {
      background-color: var(--color-bg-secondary);
      color: var(--color-text);
      border: 1px solid var(--color-white);
    }
  }
`;

const SettingsPage: React.FC = () => {
  const tabs = [
    { id: 'empresa', label: 'Empresa' },
    { id: 'facturacion', label: 'Facturación' },
    { id: 'certificado', label: 'Certificado Digital' },
    { id: 'seguridad', label: 'Seguridad' },
    { id: 'notificaciones', label: 'Notificaciones' },
    { id: 'respaldo', label: 'Respaldo' }
  ];
  const [active, setActive] = useState(tabs[0].id);
  const [config, setConfig] = useState<Configuration | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    ConfigService.getConfiguration()
      .then((data: Configuration) => setConfig(data))
      .catch((err: unknown) => { console.error(err); Swal.fire('Error', 'No se pudo cargar configuración', 'error'); })
      .finally(() => setLoadingConfig(false));
  }, []);

  const updateField = (section: keyof Configuration, field: string, value: any) => {
    setConfig(prev => prev ? ({
      ...prev,
      [section]: { ...(prev as any)[section], [field]: value }
    }) : prev);
  };

  const handleSave = async () => {
    if (!config) return;
    try {
      await ConfigService.updateConfiguration(config);
      Swal.fire('Guardado', 'Configuración actualizada correctamente', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo guardar configuración', 'error');
    }
  };

  return (
    <Container>
      <h1>Configuración</h1>
      <Tabs>
        {tabs.map(tab => (
          <Tab key={tab.id} active={active === tab.id} onClick={() => setActive(tab.id)}>
            {tab.label}
          </Tab>
        ))}
      </Tabs>
      <Section>
        {loadingConfig && <SectionLoader />}
        {!loadingConfig && config && (
          <>
            {active === 'empresa' && (
              <div>
                <label>Razón Social</label>
                <input type="text" value={config.company?.businessName || ''} onChange={e => updateField('company','businessName',e.target.value)} />
                <label>NIT</label>
                <input type="text" value={config.company?.nit || ''} onChange={e => updateField('company','nit',e.target.value)} />
                <label>Dirección</label>
                <input type="text" value={config.company?.address || ''} onChange={e => updateField('company','address',e.target.value)} />
                <label>Régimen Tributario</label>
                <input type="text" value={config.company?.taxRegime || ''} onChange={e => updateField('company','taxRegime',e.target.value)} />
                <label>Responsabilidades Fiscales</label>
                <input type="text" value={config.company?.fiscalResponsibilities || ''} onChange={e => updateField('company','fiscalResponsibilities',e.target.value)} />
                <label>Contacto</label>
                <input type="text" value={config.company?.contactInfo || ''} onChange={e => updateField('company','contactInfo',e.target.value)} />
              </div>
            )}
            {active === 'facturacion' && (
              <div>
                <label>Prefijo Factura</label>
                <input type="text" value={config.billing?.invoicePrefix || ''} onChange={e => updateField('billing','invoicePrefix',e.target.value)} />
                <label>Último Número</label>
                <input type="number" value={config.billing?.lastInvoiceNumber || ''} onChange={e => updateField('billing','lastInvoiceNumber',parseInt(e.target.value))} />
                <label>Número Resolución DIAN</label>
                <input type="text" value={config.billing?.dianResolutionNumber || ''} onChange={e => updateField('billing','dianResolutionNumber',e.target.value)} />
                <label>Fecha Inicio Resolución</label>
                <input type="date" value={config.billing?.resolutionStartDate || ''} onChange={e => updateField('billing','resolutionStartDate',e.target.value)} />
                <label>Fecha Fin Resolución</label>
                <input type="date" value={config.billing?.resolutionEndDate || ''} onChange={e => updateField('billing','resolutionEndDate',e.target.value)} />
              </div>
            )}
            {active === 'certificado' && (
              <div>
                <label>URL Certificado Digital</label>
                <input type="text" value={config.certificate?.certificateBlobUrl || ''} onChange={e => updateField('certificate','certificateBlobUrl',e.target.value)} />
                <label>Contraseña Certificado</label>
                <input type="password" value={config.certificate?.certificatePassword || ''} onChange={e => updateField('certificate','certificatePassword',e.target.value)} />
                <label>Estado Certificado</label>
                <input type="text" value={config.certificate?.certificateStatus || ''} onChange={e => updateField('certificate','certificateStatus',e.target.value)} />
                <label>Vencimiento Certificado</label>
                <input type="date" value={config.certificate?.certificateExpiryDate || ''} onChange={e => updateField('certificate','certificateExpiryDate',e.target.value)} />
              </div>
            )}
            {active === 'seguridad' && (
              <div>
                <label>Longitud Mínima Contraseña</label>
                <input type="number" value={config.security?.minPasswordLength || ''} onChange={e => updateField('security','minPasswordLength',parseInt(e.target.value))} />
                <label>Carácteres Requeridos</label>
                <input type="text" value={config.security?.requiredCharacters || ''} onChange={e => updateField('security','requiredCharacters',e.target.value)} />
                <label>Intentos Máx. Login</label>
                <input type="number" value={config.security?.maxLoginAttempts || ''} onChange={e => updateField('security','maxLoginAttempts',parseInt(e.target.value))} />
                <label>Tiempo Bloqueo (min)</label>
                <input type="number" value={config.security?.lockoutMinutes || ''} onChange={e => updateField('security','lockoutMinutes',parseInt(e.target.value))} />
                <label>Días Cambio Contraseña</label>
                <input type="number" value={config.security?.passwordChangeDays || ''} onChange={e => updateField('security','passwordChangeDays',parseInt(e.target.value))} />
              </div>
            )}
            {active === 'notificaciones' && (
              <div>
                <label>Plantillas Email</label>
                <input type="text" value={config.notifications?.emailTemplates || ''} onChange={e => updateField('notifications','emailTemplates',e.target.value)} />
                <label>Auto Notificaciones</label>
                <input type="checkbox" checked={config.notifications?.autoNotifications || false} onChange={e => updateField('notifications','autoNotifications',e.target.checked)} />
                <label>Opciones Envío Cliente</label>
                <input type="text" value={config.notifications?.clientSendOptions || ''} onChange={e => updateField('notifications','clientSendOptions',e.target.value)} />
              </div>
            )}
            {active === 'respaldo' && (
              <div>
                <label>Programación Respaldo</label>
                <input type="text" value={config.backup?.backupSchedule || ''} onChange={e => updateField('backup','backupSchedule',e.target.value)} />
                <label>Opciones Restauración</label>
                <input type="text" value={config.backup?.restoreOptions || ''} onChange={e => updateField('backup','restoreOptions',e.target.value)} />
                <label>Historial Respaldos</label>
                <input type="text" value={config.backup?.backupHistory || ''} onChange={e => updateField('backup','backupHistory',e.target.value)} />
              </div>
            )}
            <Button onClick={handleSave}>Guardar</Button>
          </>
        )}
      </Section>
    </Container>
  );
};

export default SettingsPage;
