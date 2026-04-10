ALTER TABLE public.lead_tags
ADD COLUMN IF NOT EXISTS cor VARCHAR(20) NOT NULL DEFAULT 'verde';

UPDATE public.lead_tags
SET cor = 'verde'
WHERE cor IS NULL OR trim(cor) = '';
