import { l10n } from 'vscode';
/**
 * Marks a string for localization. If a localized bundle is available for the language specified by
 * {@link env.language} and the bundle has a localized value for this message, then that localized
 * value will be returned (with injected {@link args} values for any templated values).
 *
 * @param message - The message to localize. Supports index templating where strings like `{0}` and `{1}` are
 * replaced by the item at that index in the {@link args} array.
 * @param args - The arguments to be used in the localized string. The index of the argument is used to
 * match the template placeholder in the localized string.
 * @returns localized string with injected arguments.
 *
 * @example
 * l10n.t('Hello {0}!', 'World');
 */
export const t = (message: string, ...args: Array<string | number | boolean>): string => l10n.t(`cyclomatic-complexity.${message}`, args);