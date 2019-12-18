import { FormGroup, FormControl } from '@angular/forms';

//CONTROL GROUP VALIDATORS
export function matchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
  return (group: FormGroup) => {
    let password = group.controls[passwordKey];
    let passwordConfirmation = group.controls[passwordConfirmationKey];
    if (password.value !== passwordConfirmation.value) {
      return passwordConfirmation.setErrors({ mismatchedPasswords: true })
    }
  }
}

  export function phoneValidator(control: FormControl): { [key: string]: any } {
    var phoneRegexp = /^((\\+91-?)|0)?[0-9]{10,15}$/;
    if (control.value && !phoneRegexp.test(control.value)) {
      return { invalidPhone: true };
    }
  }

export function emailValidator(control: any) {
  if (control && control.value) {
    if (control.value.match(/[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/)) {
      return null;
    } else {
      return { 'invalidEmailAddress': true };
    }
  }
}

export function passwordValidator(control: FormControl): { [key: string]: any } {
  var passwordRegexp = /^(?=.{8,})((?=.*\d)(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)(?=.*[a-zA-Z])(?=.*[\W_])|(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])).*/;
  if (control.value && !passwordRegexp.test(control.value)) {
    return { invalidPassword: true };
  }
}

export function websiteValidator(control: FormControl): { [key: string]: any } {
  var websiteRegexp = /(https?:\/\/)?([\w\d]+\.)?[\w\d]+\.\w+\/?.+$/;
  if (control.value && !websiteRegexp.test(control.value)) {
    return { invalidUrl: true };
  }
}

export function facebookUrlValidator(control: FormControl): { [key: string]: any } {
  var facebookRegexp = /(?:https?:\/\/)?(?:www\.)?facebook\.com\/.(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]*)/;
  if (control.value && !facebookRegexp.test(control.value)) {
    return { invalidFacebookUrl: true };
  }
}

export function linkdinUrlValidator(control: FormControl): { [key: string]: any } {
  var linkedinRegexp = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/.(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]*)/;
  if (control.value && !linkedinRegexp.test(control.value)) {
    return { invalidLinkdinUrl: true };
  }
}

export function twitterUrlValidator(control: FormControl): { [key: string]: any } {
  var twitterRegexp = /(?:http:\/\/)?(?:www\.)?twitter\.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-]*)/;
  if (control.value && !twitterRegexp.test(control.value)) {
    return { invalidTwitterUrl: true };
  }
}
export function googleplusUrlValidator(control: FormControl): { [key: string]: any } {
  var googleplusRegexp = /(?:http:\/\/)?(?:plus\.)?google\.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-]*)/;
  if (control.value && !googleplusRegexp.test(control.value)) {
    return { invalidGoogleUrl: true };
  }
}
export function tumblrUrlValidator(control: FormControl): { [key: string]: any } {
  var tumblrRegexp = /(?:https?:\/\/)?(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]*)?tumblr\.com/;
  if (control.value && !tumblrRegexp.test(control.value)) {
    return { invalidTumblrUrl: true };
  }
}
export function flickerUrlValidator(control: FormControl): { [key: string]: any } {
  var flickerRegexp = /(?:https?:\/\/)?(?:www\.)?flickr\.com\/photos\/.(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]*)/;
  if (control.value && !flickerRegexp.test(control.value)) {
    return { invalidFlickerUrl: true };
  }
}
export function instagramUrlValidator(control: FormControl): { [key: string]: any } {
  var instagramRegexp = /(?:https?:\/\/)?(?:www\.)?instagram\.com/;
  if (control.value && !instagramRegexp.test(control.value)) {
    return { invalidInstagramUrl: true };
  }
}
export function snapchatUrlValidator(control: FormControl): { [key: string]: any } {
  var snapchatRegexp = /(?:https?:\/\/)?(?:www\.)?snapchat\.com/;
  if (control.value && !snapchatRegexp.test(control.value)) {
    return { invalidSnapchatUrl: true };
  }
}