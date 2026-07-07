import { AppDataSource } from '../config/database';
import { ContactInquiry } from '../entities/ContactInquiry';
import { HttpError } from '../utils/httpError';

export interface CreateContactInquiryInput {
  name: string;
  workEmail: string;
  companyName?: string;
  companyWebsite?: string;
  role?: string;
  message: string;
}

export async function createContactInquiry(input: CreateContactInquiryInput): Promise<ContactInquiry> {
  const repository = AppDataSource.getRepository(ContactInquiry);

  const inquiry = repository.create({
    name: input.name,
    workEmail: input.workEmail,
    companyName: input.companyName ?? null,
    companyWebsite: input.companyWebsite ?? null,
    role: input.role ?? null,
    message: input.message,
    isRead: false,
  });

  return repository.save(inquiry);
}

export async function listContactInquiries(): Promise<ContactInquiry[]> {
  return AppDataSource.getRepository(ContactInquiry).find({
    order: { createdAt: 'DESC' },
  });
}

export async function markContactInquiryAsRead(id: string): Promise<ContactInquiry> {
  const repository = AppDataSource.getRepository(ContactInquiry);
  const inquiry = await repository.findOneBy({ id });

  if (!inquiry) {
    throw new HttpError(404, 'Contact inquiry not found');
  }

  inquiry.isRead = true;
  return repository.save(inquiry);
}

export async function deleteContactInquiry(id: string): Promise<void> {
  const repository = AppDataSource.getRepository(ContactInquiry);
  const inquiry = await repository.findOneBy({ id });

  if (!inquiry) {
    throw new HttpError(404, 'Contact inquiry not found');
  }

  await repository.remove(inquiry);
}