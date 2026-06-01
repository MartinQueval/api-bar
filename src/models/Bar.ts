import { Schema, model, InferSchemaType, HydratedDocument } from 'mongoose';
import { NOTE_CATEGORIES, NoteCategory } from '../types/noteCategory';

const noteSchema = new Schema(
  {
    category: { type: String, enum: NOTE_CATEGORIES, required: true },
    value: { type: Number, required: true, min: 0, max: 5 },
  },
  { _id: false },
);

function validateAllCategoriesPresent(notes: Array<{ category: NoteCategory }>): boolean {
  if (!notes || notes.length !== NOTE_CATEGORIES.length) return false;
  const seen = new Set(notes.map((n) => n.category));
  return NOTE_CATEGORIES.every((c) => seen.has(c));
}

const barSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    note: {
      type: [noteSchema],
      required: true,
      validate: {
        validator: validateAllCategoriesPresent,
        message: `note must contain exactly one entry for each category: ${NOTE_CATEGORIES.join(', ')}`,
      },
    },
    moy: { type: Number, default: 0 },
  },
  { timestamps: true },
);

function computeMoy(notes: Array<{ value: number }>): number {
  if (!notes || notes.length === 0) return 0;
  const sum = notes.reduce((acc, n) => acc + n.value, 0);
  return Number((sum / notes.length).toFixed(2));
}

barSchema.pre('save', function () {
  this.moy = computeMoy(this.note as Array<{ value: number }>);
});

export type BarDocument = HydratedDocument<InferSchemaType<typeof barSchema>>;
export const Bar = model('Bar', barSchema);
export { computeMoy };
