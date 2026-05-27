import { useState } from 'react';
import styles from './ManageAdmins.module.css';
import { AdminAdminsService, CreateAdminPayload } from '../../../services/adminAdmins.service';

const emptyForm: CreateAdminPayload = {
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  address: '',
  rfc: ''
};

export const AdminManageAdmins = (): React.JSX.Element => {
  const [form, setForm] = useState<CreateAdminPayload>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateField = (field: keyof CreateAdminPayload, value: string): void => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = (): string | null => {
    if (Object.values(form).some((value) => !value.trim())) {
      return 'Todos los campos son obligatorios.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return 'Correo invalido.';
    }
    if (form.password.length < 8) {
      return 'La contrasena debe tener al menos 8 caracteres.';
    }
    if (!/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i.test(form.rfc)) {
      return 'RFC invalido.';
    }
    return null;
  };

  const submit = async (): Promise<void> => {
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await AdminAdminsService.create({ ...form, rfc: form.rfc.toUpperCase() });
      setForm(emptyForm);
      setSuccess('Administrador registrado correctamente.');
    } catch {
      setError('No se pudo registrar el administrador.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header>
        <h1>Gestion de administradores</h1>
        <p>Alta segura de cuentas administrativas con RFC y correo unicos.</p>
      </header>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <section className={styles.formGrid}>
        <input placeholder="Usuario" value={form.username} onChange={(event) => updateField('username', event.target.value)} />
        <input placeholder="Nombre" value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} />
        <input placeholder="Apellidos" value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} />
        <input placeholder="Correo" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
        <input placeholder="Telefono" value={form.phoneNumber} onChange={(event) => updateField('phoneNumber', event.target.value)} />
        <input placeholder="RFC" value={form.rfc} onChange={(event) => updateField('rfc', event.target.value.toUpperCase())} />
        <input placeholder="Direccion" value={form.address} onChange={(event) => updateField('address', event.target.value)} />
        <input placeholder="Contrasena" type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} />
      </section>

      <button className={styles.submitButton} onClick={submit} disabled={isLoading}>
        {isLoading ? 'Registrando...' : 'Registrar administrador'}
      </button>
    </div>
  );
};
