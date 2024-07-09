import { Contact as PrismaContact, PrismaClient } from "@prisma/client";

type ContactBody = {
  email?: string;
  id?: number;
  phoneNumber?: string;
  linkPrecedence?: string;
  linkedId?: number | null;
};

const prisma = new PrismaClient();

export const createContact = async (contact: ContactBody) => {
  const {
    phoneNumber,
    email,
    linkedId = null,
    linkPrecedence = "primary",
  } = contact;
  const primaryContact = await prisma.contact.create({
    data: {
      email,
      phoneNumber,
      linkPrecedence,
    },
  });

  return primaryContact;
};

export const findContactByEmailOrPhoneNumber = async (contact: ContactBody) => {
  const { email, phoneNumber } = contact;
  const contacts: PrismaContact[] = await prisma.contact.findMany({
    where: {
      OR: [{ email }, { phoneNumber }],
    },
  });

  return contacts;
};

export const findContactByEmail = async (contact: ContactBody) => {
  const { email } = contact;
  const contacts = await prisma.contact.findMany({ where: { email } });

  return contacts;
};

export const findContactByPhoneNumber = async (contact: ContactBody) => {
  const { phoneNumber } = contact;
  const contacts = await prisma.contact.findMany({ where: { phoneNumber } });

  return contacts;
};

export const makeContactPrimary = async (primaryContact: PrismaContact) => {
  primaryContact = await prisma.contact.update({
    where: {
      id: primaryContact.id,
    },
    data: {
      linkPrecedence: "primary",
    },
  });
  return primaryContact;
};

export const makeContactSecondary = async (
  contact: PrismaContact,
  primaryContact: PrismaContact,
) => {
  const updatedContact = await prisma.contact.update({
    where: {
      id: contact.id,
    },
    data: {
      linkedId: primaryContact.id,
      linkPrecedence: "secondary",
    },
  });

  return updatedContact;
};

export const findContacts = async (contact: ContactBody) => {
  const { email, phoneNumber } = contact;

  let contacts: PrismaContact[] = [];

  if (email && phoneNumber) {
    contacts = await findContactByEmailOrPhoneNumber(contact);
  } else if (email) {
    contacts = await findContactByEmail(contact);
  } else if (phoneNumber) {
    contacts = await findContactByPhoneNumber(contact);
  }

  let primaryContact: PrismaContact | undefined;
  let secondaryContactIDs: number[] = [];
  let emails: string[] = [];
  let phoneNumbers: string[] = [];

  if (contacts.length === 0) {
    primaryContact = await createContact(contact);
  } else {
    primaryContact = contacts.find(
      (contact) => contact.linkPrecedence === "primary",
    );

    if (!primaryContact) {
      primaryContact = contacts[0];
      primaryContact = await makeContactPrimary(primaryContact);
    }

    for (let contact of contacts) {
      if (contact.id !== primaryContact.id) {
        if (!contact.linkedId) {
          const updatedContact = await makeContactSecondary(
            contact,
            primaryContact,
          );
          secondaryContactIDs.push(updatedContact.id);
        } else {
          secondaryContactIDs.push(contact.id);
        }
      }
      if (contact.email && !emails.includes(contact.email))
        emails.push(contact.email);
      if (contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber))
        phoneNumbers.push(contact.phoneNumber);
    }

    if (email && !emails.includes(email)) emails.push(email);
    if (phoneNumber && !phoneNumbers.includes(phoneNumber))
      phoneNumbers.push(phoneNumber);
    if (
      contacts.some(
        (contact) =>
          contact.email === email || contact.phoneNumber === phoneNumber,
      )
    ) {
      const newSecondaryContact = await createContact({
        email,
        phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: "secondary",
      });
      secondaryContactIDs.push(newSecondaryContact.id);
      if (
        newSecondaryContact.email &&
        !emails.includes(newSecondaryContact.email)
      )
        emails.push(newSecondaryContact.email);
      if (
        newSecondaryContact.phoneNumber &&
        !phoneNumbers.includes(newSecondaryContact.phoneNumber)
      )
        phoneNumbers.push(newSecondaryContact.phoneNumber);
    }
  }

  const response = {
    contact: {
      primaryContactId: primaryContact.id,
      emails: [...new Set(emails)],
      phoneNumbers: [...new Set(phoneNumbers)],
      secondaryContactIDs,
    },
  };

  return response;
};
