import { submissionInputSchema, type SubmissionInput } from '@offmap/contracts';
import { colors, fontFamilies, radii, spacing } from '@offmap/design';
import { CATEGORY_CATALOG } from '@offmap/taxonomy';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';

import { submitOpportunity } from '@/api/client';
import { ActionButton } from '@/components/action-button';
import { FilterChip } from '@/components/filter-chip';
import { OffMapText } from '@/components/offmap-text';
import { Page } from '@/components/page';

type Form = Omit<SubmissionInput, 'consent'> & { consent: boolean };
const initialForm: Form = {
  sourceUrl: '',
  title: '',
  mainCategory: 'not-sure',
  note: '',
  contactEmail: '',
  consent: false,
  website: '',
};

export function SubmitScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 600;
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<Form>(initialForm);
  const [validation, setValidation] = useState<string | null>(null);
  const mutation = useMutation({ mutationFn: submitOpportunity });

  const update = (key: keyof Form, value: Form[keyof Form]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const next = () => {
    if (!form.sourceUrl.startsWith('http://') && !form.sourceUrl.startsWith('https://')) {
      setValidation('Paste the official HTTP(S) source link first.');
      return;
    }
    if (form.title.trim().length < 3) {
      setValidation('Add a short title so editors know what to review.');
      return;
    }
    setValidation(null);
    setStep(2);
  };
  const submit = () => {
    const parsed = submissionInputSchema.safeParse(form);
    if (!parsed.success) {
      setValidation(parsed.error.issues[0]?.message || 'Check the form and try again.');
      return;
    }
    setValidation(null);
    mutation.mutate(parsed.data);
  };

  if (mutation.data) {
    return (
      <Page>
        <View style={[styles.success, compact && styles.successCompact]}>
          <OffMapText variant="handwritten" style={styles.kicker}>
            one link can open a door
          </OffMapText>
          <OffMapText
            accessibilityRole="header"
            variant="display"
            style={[styles.display, compact && styles.displayCompact]}
          >
            got it.
          </OffMapText>
          <OffMapText variant="subtitle">{mutation.data.message}</OffMapText>
          <OffMapText variant="label">Reference {mutation.data.reference}</OffMapText>
          <ActionButton
            label="Add another"
            tone="lime"
            onPress={() => {
              mutation.reset();
              setForm(initialForm);
              setStep(1);
            }}
          />
        </View>
      </Page>
    );
  }

  return (
    <Page>
      <View style={styles.header}>
        <OffMapText variant="handwritten" style={styles.kicker}>
          found something worthwhile?
        </OffMapText>
        <OffMapText
          accessibilityRole="header"
          variant="display"
          style={[styles.display, compact && styles.displayCompact]}
        >
          pass it on.
        </OffMapText>
        <OffMapText variant="subtitle" style={styles.intro}>
          Send the official link. Humans check every submission before it appears; AI may prepare
          cited notes, but it never publishes.
        </OffMapText>
        <View style={styles.progress} accessibilityLabel={`Step ${step} of 2`}>
          <View style={[styles.progressBar, styles.progressActive]} />
          <View style={[styles.progressBar, step === 2 && styles.progressActive]} />
        </View>
      </View>

      <View style={[styles.form, compact && styles.formCompact]}>
        {step === 1 ? (
          <>
            <Field
              label="Official source URL"
              hint="Use the organizer or official application page."
            >
              <TextInput
                accessibilityLabel="Official source URL"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                placeholder="https://…"
                placeholderTextColor={colors.mutedInk}
                value={form.sourceUrl}
                onChangeText={(value) => update('sourceUrl', value)}
                style={styles.input}
              />
            </Field>
            <Field label="Opportunity title">
              <TextInput
                accessibilityLabel="Opportunity title"
                placeholder="What is it called?"
                placeholderTextColor={colors.mutedInk}
                value={form.title}
                onChangeText={(value) => update('title', value)}
                style={styles.input}
              />
            </Field>
            <ActionButton label="Next: a little context" tone="ink" onPress={next} />
          </>
        ) : (
          <>
            <Field label="Broad category" hint="Not sure is a valid answer.">
              <View style={styles.chips}>
                <FilterChip
                  label="Not sure"
                  selected={form.mainCategory === 'not-sure'}
                  onPress={() => update('mainCategory', 'not-sure')}
                />
                {Object.entries(CATEGORY_CATALOG).map(([value, definition]) => (
                  <FilterChip
                    key={value}
                    label={`${definition.emoji} ${definition.title}`}
                    selected={form.mainCategory === value}
                    onPress={() => update('mainCategory', value)}
                  />
                ))}
              </View>
            </Field>
            <Field
              label="What should we notice?"
              hint="Optional. Do not paste personal documents or sensitive information."
            >
              <TextInput
                accessibilityLabel="Note for editors"
                multiline
                textAlignVertical="top"
                placeholder="A deadline, eligibility detail, or why students might miss it…"
                placeholderTextColor={colors.mutedInk}
                value={form.note}
                onChangeText={(value) => update('note', value)}
                style={[styles.input, styles.textarea]}
              />
            </Field>
            <Field
              label="Email for one follow-up"
              hint="Optional, private, and deleted after 30 days."
            >
              <TextInput
                accessibilityLabel="Optional contact email"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor={colors.mutedInk}
                value={form.contactEmail || ''}
                onChangeText={(value) => update('contactEmail', value)}
                style={styles.input}
              />
            </Field>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: form.consent }}
              onPress={() => update('consent', !form.consent)}
              style={({ pressed }) => [styles.consent, pressed && styles.pressed]}
            >
              <View style={[styles.checkbox, form.consent && styles.checkboxChecked]}>
                <OffMapText variant="bodyBold">{form.consent ? '✓' : ''}</OffMapText>
              </View>
              <OffMapText style={styles.consentText}>
                I confirm this is a public opportunity source and agree that OffMap editors may
                review it.
              </OffMapText>
            </Pressable>
            <View style={styles.formActions}>
              <ActionButton label="Back" tone="paper" onPress={() => setStep(1)} />
              <ActionButton
                label="Send to human review"
                tone="blue"
                busy={mutation.isPending}
                onPress={submit}
              />
            </View>
          </>
        )}
        {validation ? (
          <OffMapText accessibilityRole="alert" style={styles.error}>
            {validation}
          </OffMapText>
        ) : null}
        {mutation.isError ? (
          <OffMapText accessibilityRole="alert" style={styles.error}>
            {mutation.error.message}
          </OffMapText>
        ) : null}
      </View>
    </Page>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <OffMapText variant="bodyBold">{label}</OffMapText>
      {hint ? <OffMapText style={styles.hint}>{hint}</OffMapText> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { maxWidth: 800, gap: spacing.md, marginBottom: spacing.xxl },
  kicker: { color: colors.orange },
  display: { fontSize: 58, lineHeight: 60 },
  displayCompact: { fontSize: 43, lineHeight: 45 },
  intro: { color: colors.mutedInk },
  progress: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  progressBar: {
    width: 80,
    height: 8,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.paperRaised,
  },
  formCompact: { width: '100%', padding: spacing.lg, borderRadius: radii.medium },
  progressActive: { backgroundColor: colors.lime },
  form: {
    maxWidth: 820,
    gap: spacing.xl,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radii.large,
    backgroundColor: colors.paperRaised,
  },
  field: { gap: spacing.sm },
  hint: { color: colors.mutedInk, fontSize: 14 },
  input: {
    minHeight: 52,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.paper,
    color: colors.ink,
    fontFamily: fontFamilies.body,
    fontSize: 16,
  },
  textarea: { minHeight: 130 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  consent: { minHeight: 56, flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  checkbox: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
  checkboxChecked: { backgroundColor: colors.lime },
  consentText: { flex: 1 },
  formActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  error: { color: colors.danger, fontFamily: fontFamilies.bodyBold },
  pressed: { opacity: 0.7 },
  success: {
    maxWidth: 760,
    minHeight: 480,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: spacing.xl,
    padding: spacing.xxl,
    borderWidth: 3,
    borderColor: colors.ink,
    borderRadius: radii.large,
    backgroundColor: colors.lime,
  },
  successCompact: {
    width: '100%',
    minHeight: 380,
    padding: spacing.xl,
    borderRadius: radii.medium,
  },
});
