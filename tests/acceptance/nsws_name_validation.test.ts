import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import request from 'supertest';
import { createCompanionApp } from '../../src/backend/companionApp';
import { NSWSSimulationView, CUSTOM_PRESET_DEF } from '../../src/features/nsws/NSWSSimulationView';

describe('NSWS Custom Institution Legal Name Validation Feedback Suite', () => {
  let app: any;

  beforeEach(() => {
    const companion = createCompanionApp();
    app = companion.app;
  });

  it('verifies CUSTOM_PRESET_DEF initial empty legal name and custom badge', () => {
    expect(CUSTOM_PRESET_DEF.id).toBe('custom');
    expect(CUSTOM_PRESET_DEF.name).toBe('');
    expect(CUSTOM_PRESET_DEF.badge).toBe('Manual Dynamic Intake');
  });

  it('renders NSWSSimulationView static markup containing validation elements and presets', () => {
    const html = renderToStaticMarkup(React.createElement(NSWSSimulationView, {}));
    expect(html).toContain('NSWS Single-Window Registration');
    expect(html).toContain('Custom Technical Institution / Interactive Dynamic Intake');
    expect(html).toContain('Custom Mode Active');
  });

  it('rejects custom application submission when institutionName is empty string (HTTP 422)', async () => {

    const res = await request(app)
      .post('/api/v1/nsws/submit')
      .send({
        selectedPresetId: 'custom',
        nswsReference: 'NSWS-CUSTOM-TEST-001',
        institutionName: '',
        facts: {
          institutionName: '',
          category: 'increase_intake',
          program: 'Engineering and Technology',
          level: 'Under Graduate',
          existingIntake: 120,
          proposedIntake: 180,
          region: 'Western'
        }
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(res.body.error.message).toContain('Institution Legal Name is required');
  });

  it('rejects custom application submission when institutionName is whitespace-only (HTTP 422)', async () => {
    const res = await request(app)
      .post('/api/v1/nsws/submit')
      .send({
        selectedPresetId: 'custom',
        nswsReference: 'NSWS-CUSTOM-TEST-002',
        institutionName: '     ',
        facts: {
          institutionName: '     ',
          category: 'increase_intake',
          program: 'Engineering and Technology',
          level: 'Under Graduate',
          existingIntake: 120,
          proposedIntake: 180,
          region: 'Western'
        }
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(res.body.error.message).toContain('Institution Legal Name is required');
  });

  it('rejects custom application submission when idempotencyKey contains CUSTOM and institutionName is omitted (HTTP 422)', async () => {
    const res = await request(app)
      .post('/api/v1/nsws/submit')
      .send({
        idempotencyKey: 'IDEMP-CUSTOM-SUBMIT-999',
        nswsReference: 'NSWS-CUSTOM-TEST-003',
        facts: {
          category: 'increase_intake',
          program: 'Engineering and Technology',
          level: 'Under Graduate',
          existingIntake: 120,
          proposedIntake: 180,
          region: 'Western'
        }
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(res.body.error.message).toContain('Institution Legal Name is required');
  });

  it('accepts custom application submission when a valid non-empty legal name is provided', async () => {
    const res = await request(app)
      .post('/api/v1/nsws/submit')
      .send({
        selectedPresetId: 'custom',
        nswsReference: 'NSWS-CUSTOM-TEST-004',
        institutionName: 'Aryabhatta Institute of Advanced Tech',
        institutionId: 'INST-CUSTOM-AIAT-004',
        category: 'increase_intake',
        session: '2026-27',
        pan: 'AAATA9876C',
        signatoryName: 'Dr. K. S. Raman',
        dscTokenSerial: 'EP2003-9876-AIAT',
        regionId: 'Western',
        facts: {
          institutionName: 'Aryabhatta Institute of Advanced Tech',
          category: 'increase_intake',
          program: 'Engineering and Technology',
          level: 'Under Graduate',
          existingIntake: 120,
          proposedIntake: 180,
          nbaAccredited: true,
          nbaScore: 700,
          builtUpAreaSqM: 14500,
          region: 'Western',
          email: 'director@aiat.edu.in'
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.application.facts.institutionName).toBe('Aryabhatta Institute of Advanced Tech');
  });
});
