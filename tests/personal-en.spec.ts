import { test } from '@playwright/test';
import { uniqueEmail } from './helpers/test-data';
import { PersonalVpnEnPage } from './pages/personal-vpn-en.page';

test.describe('Personal VPN EN checkout form', () => {
  let personalVpn: PersonalVpnEnPage;

  test.beforeEach(async ({ page }) => {
    personalVpn = new PersonalVpnEnPage(page);
    await personalVpn.goto();
  });

  test('shows default options and checkout form controls', async () => {
    await personalVpn.expectDefaultOptionsVisible();
  });

  for (const { planName, value } of [
    { planName: '1 month', value: '1_month' },
    { planName: '1 year', value: '1_year' },
  ] as const) {
    test(`opens payment method page after choosing ${planName}`, async () => {
      const email = uniqueEmail(`personal.en.${planName.replace(/\s+/g, '')}`);

      await personalVpn.selectPlan(value);
      await personalVpn.fillEmail(email);
      await personalVpn.expectDefaultLocationAndCurrencySelected();
      await personalVpn.continueToPaymentMethods(value, email);
      await personalVpn.expectPaymentMethodsVisible();
    });
  }

  for (const { gatewayName, gatewayValue } of [
    { gatewayName: 'Credit Card', gatewayValue: 'stripe' },
    { gatewayName: 'Cryptocurrency', gatewayValue: 'crypto' },
  ] as const) {
    test(`selects ${gatewayName} on the payment method page`, async () => {
      await personalVpn.completePlanStep();
      await personalVpn.selectGateway(gatewayValue);
      await personalVpn.expectTermsControlsVisible();
    });
  }

  for (const { gatewayName, gatewayValue } of [
    { gatewayName: 'Credit Card', gatewayValue: 'stripe' },
    { gatewayName: 'Cryptocurrency', gatewayValue: 'crypto' },
  ] as const) {
    test(`creates external ${gatewayName} payment link after final Pay is clicked`, async () => {
      test.fail(
        true,
        'Known defect: final Pay on Personal VPN EN redirects to /payment/failed/ with Transaction was rejected.',
      );

      await personalVpn.completePlanStep();
      await personalVpn.selectGateway(gatewayValue);
      await personalVpn.acceptTerms();

      await personalVpn.submitFinalPayment();
      await personalVpn.expectExternalPaymentPage(gatewayValue);
    });
  }
});
