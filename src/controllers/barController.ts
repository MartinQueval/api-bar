import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { Bar, computeMoy } from '../models/Bar';

export async function createBar(req: Request, res: Response) {
  const { name, lat, lng, note } = req.body;
  const bar = await Bar.create({ name, lat, lng, note: note ?? [] });
  res.status(201).json(bar);
}

export async function listBars(_req: Request, res: Response) {
  const bars = await Bar.find().sort({ createdAt: -1 });
  res.json(bars);
}

export async function getBar(req: Request, res: Response) {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

  const bar = await Bar.findById(id);
  if (!bar) return res.status(404).json({ error: 'Bar not found' });
  res.json(bar);
}

export async function updateBar(req: Request, res: Response) {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

  const { name, lat, lng, note } = req.body;

  const bar = await Bar.findById(id);
  if (!bar) return res.status(404).json({ error: 'Bar not found' });

  if (name !== undefined) bar.name = name;
  if (lat !== undefined) bar.lat = lat;
  if (lng !== undefined) bar.lng = lng;
  if (note !== undefined) bar.set('note', note);

  await bar.save();
  res.json(bar);
}

export async function deleteBar(req: Request, res: Response) {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });

  const bar = await Bar.findByIdAndDelete(id);
  if (!bar) return res.status(404).json({ error: 'Bar not found' });
  res.status(204).send();
}
