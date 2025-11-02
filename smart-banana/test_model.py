import tensorflow as tf
from tensorflow.keras.mixed_precision import Policy

# --- Patch for InputLayer: remap 'batch_shape' to 'batch_input_shape' ---
original_inputlayer_from_config = tf.keras.layers.InputLayer.from_config

@classmethod
def patched_inputlayer_from_config(cls, config):
    if 'batch_shape' in config:
        config['batch_input_shape'] = config.pop('batch_shape')
    return original_inputlayer_from_config(config)

tf.keras.layers.InputLayer.from_config = patched_inputlayer_from_config
# --- End Patch for InputLayer ---

# --- Patch for Mixed Precision Policy ---
original_policy_from_config = Policy.from_config

def patched_policy_from_config(config):
    # If config is a dict with nested config containing 'name', use that name to create a Policy.
    if isinstance(config, dict) and 'config' in config and 'name' in config['config']:
        return Policy(config['config']['name'])
    return original_policy_from_config(config)

Policy.from_config = staticmethod(patched_policy_from_config)
# --- End Patch for Mixed Precision Policy ---

from tensorflow.keras.models import load_model

# Now load your model
model = load_model('banana_disease_classification_model.keras')
print("Model loaded successfully!")
