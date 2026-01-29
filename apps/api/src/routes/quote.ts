/**
 * Quote API routes.
 * 
 * Handles quote request submission and admin quote management.
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { QuoteRequest, QuoteStatus } from '@cart-configurator/types';

export function quoteRouter(prisma: PrismaClient): Router {
  const router = Router();

  /**
   * POST /api/quotes
   * Submits a new quote request.
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      const quoteRequest: QuoteRequest = req.body;

      const quote = await prisma.quote.create({
        data: {
          configurationId: quoteRequest.configurationId,
          customerName: quoteRequest.customerName,
          customerEmail: quoteRequest.customerEmail,
          customerPhone: quoteRequest.customerPhone,
          message: quoteRequest.message,
          status: QuoteStatus.PENDING,
          submittedAt: quoteRequest.submittedAt
        }
      });

      res.json({ success: true, quoteId: quote.id });
    } catch (error) {
      console.error('Error submitting quote:', error);
      res.status(500).json({ error: 'Failed to submit quote' });
    }
  });

  /**
   * GET /api/quotes
   * Lists all quote requests (admin endpoint).
   */
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const quotes = await prisma.quote.findMany({
        orderBy: { submittedAt: 'desc' },
        include: {
          configuration: true
        }
      });

      res.json(quotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      res.status(500).json({ error: 'Failed to fetch quotes' });
    }
  });

  /**
   * GET /api/quotes/:id
   * Retrieves a specific quote by ID.
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const quote = await prisma.quote.findUnique({
        where: { id },
        include: {
          configuration: true
        }
      });

      if (!quote) {
        res.status(404).json({ error: 'Quote not found' });
        return;
      }

      res.json(quote);
    } catch (error) {
      console.error('Error fetching quote:', error);
      res.status(500).json({ error: 'Failed to fetch quote' });
    }
  });

  /**
   * PATCH /api/quotes/:id/status
   * Updates the status of a quote (admin endpoint).
   */
  router.patch('/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(QuoteStatus).includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const updated = await prisma.quote.update({
        where: { id },
        data: { status }
      });

      res.json({ success: true, quote: updated });
    } catch (error) {
      console.error('Error updating quote status:', error);
      res.status(500).json({ error: 'Failed to update quote status' });
    }
  });

  return router;
}
