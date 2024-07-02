import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import { PrismaClient, Contact as PrismaContact } from "@prisma/client";

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.use(bodyParser.json());

app.post("/identify", async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "email or phoneNumber is required" });
  }

  let contacts: PrismaContact[] = [];

  if (email && phoneNumber) {
    contacts = await prisma.contact.findMany({
      where: {
        OR: [{ email }, { phoneNumber }],
      },
    });
  } else if (email) {
    contacts = await prisma.contact.findMany({ where: { email } });
  } else if (phoneNumber) {
    contacts = await prisma.contact.findMany({ where: { phoneNumber } });
  }

  let primaryContact: PrismaContact | undefined;
  let secondaryContactIDs: number[] = [];
  let emails: string[] = [];
  let phoneNumbers: string[] = [];

  if (contacts.length === 0) {
    primaryContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: "primary",
      },
    });
  } else {
    primaryContact = contacts.find(
      (contact) => contact.linkPrecedence === "primary",
    );

    if (!primaryContact) {
      primaryContact = contacts[0];
      primaryContact = await prisma.contact.update({
        where: {
          id: primaryContact.id,
        },
        data: {
          linkPrecedence: "primary",
        },
      });
    }

    for (let contact of contacts) {
      if (contact.id !== primaryContact.id) {
        if (!contact.linkedId) {
          const updatedContact = await prisma.contact.update({
            where: {
              id: contact.id,
            },
            data: {
              linkedId: primaryContact.id,
              linkPrecedence: "secondary",
            },
          });
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
      const newSecondaryContact = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkedId: primaryContact.id,
          linkPrecedence: "secondary",
        },
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

  return res.status(200).json(response);
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
