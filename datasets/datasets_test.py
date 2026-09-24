"""
Test the Intent Detection Agent against real Banking77 dataset queries,
using the DeepPavlov/banking77 mirror (auto-converted to parquet,
since PolyAI/banking77 itself has no parquet conversion or working
datasets-server API).

Scores against actual ground-truth labels via a category mapping,
and saves results (summary + per-query detail) to a timestamped
JSON file under eval_results/.
"""

import os
import json
from datetime import datetime

import pandas as pd
import random
from agents.intent_detector import detect_intent

# Full Banking77 label -> your agent's category taxonomy.
# Adjust the right-hand values if your agent uses different category names.
LABEL_TO_CATEGORY = {
    0: "technical",      # activate_my_card
    1: "general_faq",    # age_limit
    2: "product",         # apple_pay_or_google_pay
    3: "general_faq",    # atm_support
    4: "product",         # automatic_top_up
    5: "billing",         # balance_not_updated_after_bank_transfer
    6: "billing",         # balance_not_updated_after_cheque_or_cash_deposit
    7: "general_faq",    # beneficiary_not_allowed
    8: "billing",         # cancel_transfer
    9: "general_faq",    # card_about_to_expire
    10: "general_faq",   # card_acceptance
    11: "general_faq",   # card_arrival
    12: "general_faq",   # card_delivery_estimate
    13: "technical",     # card_linking
    14: "technical",     # card_not_working
    15: "billing",        # card_payment_fee_charged
    16: "complaint",      # card_payment_not_recognised
    17: "billing",        # card_payment_wrong_exchange_rate
    18: "complaint",      # card_swallowed
    19: "billing",        # cash_withdrawal_charge
    20: "complaint",      # cash_withdrawal_not_recognised
    21: "technical",     # change_pin
    22: "complaint",      # compromised_card
    23: "technical",     # contactless_not_working
    24: "general_faq",   # country_support
    25: "billing",        # declined_card_payment
    26: "billing",        # declined_cash_withdrawal
    27: "billing",        # declined_transfer
    28: "complaint",      # direct_debit_payment_not_recognised
    29: "general_faq",   # disposable_card_limits
    30: "technical",     # edit_personal_details
    31: "billing",        # exchange_charge
    32: "general_faq",   # exchange_rate
    33: "general_faq",   # exchange_via_app
    34: "complaint",      # extra_charge_on_statement
    35: "billing",        # failed_transfer
    36: "general_faq",   # fiat_currency_support
    37: "product",         # get_disposable_virtual_card
    38: "product",         # get_physical_card
    39: "product",         # getting_spare_card
    40: "product",         # getting_virtual_card
    41: "complaint",      # lost_or_stolen_card
    42: "complaint",      # lost_or_stolen_phone
    43: "product",         # order_physical_card
    44: "technical",     # passcode_forgotten
    45: "billing",        # pending_card_payment
    46: "billing",        # pending_cash_withdrawal
    47: "billing",        # pending_top_up
    48: "billing",        # pending_transfer
    49: "technical",     # pin_blocked
    50: "billing",        # receiving_money
    51: "refund",          # Refund_not_showing_up
    52: "refund",          # request_refund
    53: "complaint",      # reverted_card_payment?
    54: "general_faq",   # supported_cards_and_currencies
    55: "general_faq",   # terminate_account
    56: "billing",        # top_up_by_bank_transfer_charge
    57: "billing",        # top_up_by_card_charge
    58: "billing",        # top_up_by_cash_or_cheque
    59: "technical",     # top_up_failed
    60: "general_faq",   # top_up_limits
    61: "billing",        # top_up_reverted
    62: "general_faq",   # topping_up_by_card
    63: "billing",        # transaction_charged_twice
    64: "billing",        # transfer_fee_charged
    65: "billing",        # transfer_into_account
    66: "complaint",      # transfer_not_received_by_recipient
    67: "general_faq",   # transfer_timing
    68: "technical",     # unable_to_verify_identity
    69: "general_faq",   # verify_my_identity
    70: "general_faq",   # verify_source_of_funds
    71: "general_faq",   # verify_top_up
    72: "technical",     # virtual_card_not_working
    73: "general_faq",   # visa_or_mastercard
    74: "general_faq",   # why_verify_identity
    75: "complaint",      # wrong_amount_of_cash_received
    76: "billing",        # wrong_exchange_rate_for_cash_withdrawal
}

LABEL_NAMES = {
    0: "activate_my_card", 1: "age_limit", 2: "apple_pay_or_google_pay", 3: "atm_support",
    4: "automatic_top_up", 5: "balance_not_updated_after_bank_transfer",
    6: "balance_not_updated_after_cheque_or_cash_deposit", 7: "beneficiary_not_allowed",
    8: "cancel_transfer", 9: "card_about_to_expire", 10: "card_acceptance", 11: "card_arrival",
    12: "card_delivery_estimate", 13: "card_linking", 14: "card_not_working",
    15: "card_payment_fee_charged", 16: "card_payment_not_recognised",
    17: "card_payment_wrong_exchange_rate", 18: "card_swallowed", 19: "cash_withdrawal_charge",
    20: "cash_withdrawal_not_recognised", 21: "change_pin", 22: "compromised_card",
    23: "contactless_not_working", 24: "country_support", 25: "declined_card_payment",
    26: "declined_cash_withdrawal", 27: "declined_transfer",
    28: "direct_debit_payment_not_recognised", 29: "disposable_card_limits",
    30: "edit_personal_details", 31: "exchange_charge", 32: "exchange_rate",
    33: "exchange_via_app", 34: "extra_charge_on_statement", 35: "failed_transfer",
    36: "fiat_currency_support", 37: "get_disposable_virtual_card", 38: "get_physical_card",
    39: "getting_spare_card", 40: "getting_virtual_card", 41: "lost_or_stolen_card",
    42: "lost_or_stolen_phone", 43: "order_physical_card", 44: "passcode_forgotten",
    45: "pending_card_payment", 46: "pending_cash_withdrawal", 47: "pending_top_up",
    48: "pending_transfer", 49: "pin_blocked", 50: "receiving_money",
    51: "Refund_not_showing_up", 52: "request_refund", 53: "reverted_card_payment",
    54: "supported_cards_and_currencies", 55: "terminate_account",
    56: "top_up_by_bank_transfer_charge", 57: "top_up_by_card_charge",
    58: "top_up_by_cash_or_cheque", 59: "top_up_failed", 60: "top_up_limits",
    61: "top_up_reverted", 62: "topping_up_by_card", 63: "transaction_charged_twice",
    64: "transfer_fee_charged", 65: "transfer_into_account",
    66: "transfer_not_received_by_recipient", 67: "transfer_timing",
    68: "unable_to_verify_identity", 69: "verify_my_identity", 70: "verify_source_of_funds",
    71: "verify_top_up", 72: "virtual_card_not_working", 73: "visa_or_mastercard",
    74: "why_verify_identity", 75: "wrong_amount_of_cash_received",
    76: "wrong_exchange_rate_for_cash_withdrawal",
}

print("Fetching Banking77 test split (parquet, via DeepPavlov mirror)...")

url = "https://huggingface.co/datasets/DeepPavlov/banking77/resolve/refs%2Fconvert%2Fparquet/default/test/0000.parquet"
df = pd.read_parquet(url)

text_col, label_col = "utterance", "label"

SAMPLE_SIZE = 50
random.seed(42)
sample = df.sample(SAMPLE_SIZE, random_state=42).to_dict("records")

correct = 0
total = len(sample)
detailed_results = []

print(f"\nTesting {total} random real customer queries against ground truth...\n")
print("-" * 70)

for item in sample:
    query = item[text_col]
    label_id = int(item[label_col])
    label_name = LABEL_NAMES.get(label_id, "unknown")
    expected_category = LABEL_TO_CATEGORY.get(label_id)

    predicted_intents = detect_intent(query)
    is_correct = expected_category is not None and expected_category in predicted_intents

    print(f"Query: {query}")
    print(f"  Ground truth: {label_name} (label {label_id}) -> expected category: {expected_category}")
    print(f"  Our agent predicted: {predicted_intents}")
    print("  -> Match" if is_correct else "  -> Mismatch")
    print("-" * 70)

    if is_correct:
        correct += 1

    detailed_results.append({
        "query": query,
        "ground_truth_label_id": label_id,
        "ground_truth_label_name": label_name,
        "expected_category": expected_category,
        "predicted_intents": predicted_intents,
        "correct": is_correct,
    })

accuracy = correct / total * 100
print(f"\n{correct}/{total} queries matched ground-truth category ({accuracy:.1f}% accuracy)")

# --- Save results to eval_results/ ---
timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
results_dir = "eval_results"
os.makedirs(results_dir, exist_ok=True)

summary = {
    "timestamp": timestamp,
    "dataset": "Banking77 (via DeepPavlov parquet mirror)",
    "sample_size": total,
    "correct": correct,
    "accuracy_pct": round(accuracy, 1),
}

json_path = os.path.join(results_dir, f"eval_{timestamp}.json")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump({"summary": summary, "results": detailed_results}, f, indent=2, ensure_ascii=False)

print(f"Saved results to {json_path}")